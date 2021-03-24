import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Candidates } from '../entities/candidates.entity';
import { getConnection } from 'typeorm';
import { InterviewSlotStatus } from './enum/recruitment.enum';
import { InterviewSlots } from '../entities/interview-slots.entity';
import { CandidateSlotDto } from './dto/candidate-book-slot.dto';
import { Schedule } from '../entities/schedule.entity';
import { EmailDto } from 'src/common/email/dto/email.dto';
import * as config from 'config';
import { JobInterviewers } from '../entities/job-interviewers.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as moment from 'moment';
import { CandidateFilter, CandidateStatus } from 'src/candidates/enum/candidate.enum';
import { Jobs } from 'src/entities/job-posting.entity';
import { UserRole } from 'src/users/enums/user.enum';
import { CandidateStatusDto } from './dto/candidate-status.dto';
import { Feedback } from 'src/entities/feedback.entity';
import { JobRoundType } from 'src/job-posting/enum/job.enum';

@Injectable()
export class RecruitmentService {
    
    constructor(
        private readonly mailerService: MailerService
    ){}

    async getInteviewSlotsByCandidateId(candidateId: number, round: number){
        const candidateConnection = getConnection('default');
        const interviewSlots = await candidateConnection.getRepository(InterviewSlots).createQueryBuilder('slots')
                                    .leftJoinAndSelect('slots.schedule', 'schedule')
                                    .leftJoinAndSelect('slots.candidate', 'candidate')
                                    .select(['slots.id', 'slots.date', 'schedule.startTime', 'schedule.endTime'])
                                    .where('candidate.id = :candidateId', {candidateId})
                                    .andWhere('slots.round = :round', {round})
                                    .orderBy('slots.createdAt', 'DESC')
                                    .getMany();
        
        return interviewSlots;
    }

    async createInterviewSlot(candidateSlotDto: CandidateSlotDto, user: User): Promise<any>{

        const {candidateId,scheduleId,date,currentRound,interviewMode} = candidateSlotDto;
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        await queryRunner.connect();

        const candidate = await queryRunner.manager.findOne(Candidates, {
            relations: ['jobs'],
            where:{id: candidateId}
        });
        const existingSlot = await queryRunner.manager.findOne(InterviewSlots, {
            relations: ['candidate'],
            where: {candidate: candidateId, interviewStatus: InterviewSlotStatus.scheduled}
        });
      
        if(existingSlot || candidate.candidateStatus == CandidateStatus.scheduled
            || candidate.candidateStatus === CandidateStatus.notSelected
            || candidate.candidateStatus === CandidateStatus.hold)
        {
            return {show:{type:'error',message:'Interview already scheduled for current round, please cancel existing schedule'}}
        }

        const bookedSlot = await queryRunner.manager.findOne(InterviewSlots, {
            where: {date, schedule: scheduleId, interviewStatus: InterviewSlotStatus.scheduled}
        });

        if(bookedSlot){
            return {show:{type:'error',message:'Selected slot is not available, kindly select another slot'}}
        }
       
        const schedule = await queryRunner.manager.findOne(Schedule, {
            relations: ['panelist'],
            where:{id: scheduleId}
        });
        
        if(candidate.candidatePhoto === null){
            return {show:{type:'error',message:'Please upload the candidate photo first'}}
        }

        if(moment(date).format('Y-M-DD') === moment().format('Y-M-DD')){
            if(moment(schedule.startTime, 'h:mm A').format('HH:mm') < moment().format('HH:mm')){
                return {show:{type:'error',message:'Invalid Interview Schedule'}}
            }
        }
        
        let slot = new InterviewSlots();

        slot.date = date;
        slot.round = currentRound + 1;
        slot.interviewMode = interviewMode;
        slot.candidate = candidate;
        slot.schedule = schedule;
        slot.panelist = schedule.panelist;

        candidate.currentRound = candidate.currentRound + 1;
        candidate.candidateStatus = CandidateStatus.scheduled;
        
       
        const jobInterviewers = await queryRunner.manager.findOne(JobInterviewers, {
            where: {panelist: schedule.panelist.id, jobs: candidate.jobs.id}
        });
        
        await queryRunner.startTransaction();
        try{
            await queryRunner.manager.save(slot);
            await queryRunner.manager.save(candidate);
            await queryRunner.commitTransaction();
        }catch(error){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        }finally{
            await queryRunner.release();
        }

        const panelistParams = {
            to: schedule.panelist.email,
            username: schedule.panelist.name,
            subject: `Interview scheduled for ${candidate.jobs.title} with ${candidate.name}`,
            template: 'interviewSchedulePanelist',
            feedbackLink: '/feedback/?candidateId='+candidate.id,
            job: candidate.jobs.title,
            sendFeedbackLink: jobInterviewers.roundType === JobRoundType.hr ? false : true,
            candidateName: candidate.name,
            interviewDate: moment(date).format('D-MMM-y'),
            interviewSlot: `${schedule.startTime} - ${schedule.endTime}`,
            resume: candidate.resume
        }
        
        const candidateParams = {
            to: candidate.email,
            username: candidate.name,
            subject: `Interview scheduled for ${jobInterviewers.roundType} round`,
            template: 'interviewScheduleCandidate',
            job: candidate.jobs.title,
            roundType: jobInterviewers.roundType,
            interviewDate: moment(date).format('D-MMM-y'),
            interviewSlot: `${schedule.startTime} - ${schedule.endTime}`
        }
        
        this.sendPanelistMail(panelistParams);
        this.sendCandidateMail(candidateParams);

        return {show:{type:'success',message:'Interview scheduled successfully'},interviewSlots: await this.getInteviewSlotsByCandidateId(candidateId, slot.round)}; 

    }

    async deleteCandidateInterviewSlot(slotId: number, user: User): Promise<object>{  
        
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        await queryRunner.connect();

        const interviewSlot = await queryRunner.manager.findOne(InterviewSlots, 
            {
                relations: ['candidate','panelist','schedule'],
                where: [{id: slotId}]
            });
            
       
        const candidate = await queryRunner.manager.findOne(Candidates, 
            {
                relations: ['jobs'],
                where: [{id: interviewSlot.candidate.id}]
            });
        
        if(candidate.candidateStatus !== CandidateStatus.scheduled){
            return {show:{type:'error',message:'This interview might have been completed or cancelled already'}}
        }

        candidate.candidateStatus = candidate.currentRound == 1 ? CandidateStatus.shortlisted : CandidateStatus.inprogress;
        candidate.currentRound = candidate.currentRound > 0 ? candidate.currentRound - 1 : candidate.currentRound;
        interviewSlot.interviewStatus = InterviewSlotStatus.cancelled;
        
        await queryRunner.startTransaction();
        try{
           
            await queryRunner.manager.save(candidate);
            await queryRunner.manager.save(interviewSlot);
            await queryRunner.commitTransaction();

        }catch(error){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        }finally{
            await queryRunner.release();
        }
        
        const panelistParams = {
            to: interviewSlot.panelist.email,
            username: interviewSlot.panelist.name,
            subject: `Interview Cancelled`,
            template: 'rescheduleMailPanelist',
            job: candidate.jobs.title,
            candidateName: interviewSlot.candidate.name,
            interviewDate: moment(interviewSlot.date).format('D-MMM-y'),
            interviewSlot: `${interviewSlot.schedule.startTime} - ${interviewSlot.schedule.endTime}`
        }
         
        const candidateParams = {
            to: candidate.email,
            username: candidate.name,
            subject: `Interview Cancelled`,
            template: 'rescheduleMailCandidate',
            job: candidate.jobs.title,
            interviewDate: moment(interviewSlot.date).format('D-MMM-y'),
            interviewSlot: `${interviewSlot.schedule.startTime} - ${interviewSlot.schedule.endTime}`
        }

        if(moment(interviewSlot.date).format('Y-M-d') >= moment().format('Y-M-d')){
            this.sendRescheduleMail(panelistParams);
            this.sendRescheduleMail(candidateParams);
        }

        return {show:{type:'success',message:'Interview deleted successfully'}}; 
    }

    async updateCandidateJob(candidateId: number, jobId: number, user: User): Promise<object>{
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        await queryRunner.connect();
        
        let candidate = await candidateConnection.getRepository(Candidates).createQueryBuilder('candidate')
                                    .where('candidate.id = :id', {id: candidateId})
                                    .getOne();
        
        if(candidate.candidateStatus === CandidateStatus.scheduled){
            return {show:{type:'error',message:'Kindly delete the scheduled interview of current job'}}
        }
        const job = await candidateConnection.getRepository(Jobs).createQueryBuilder('job')
                                    .where('job.id = :id', {id: jobId})
                                    .getOne();
        
        candidate.candidateStatus = CandidateStatus.shortlisted;
        candidate.currentRound = 0;
        candidate.jobs = job;

        await queryRunner.startTransaction();
        try{
            await candidateConnection.manager.save(candidate);
            await queryRunner.commitTransaction();
        }catch(error){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        }finally{
            await queryRunner.release();
        }

        return {show:{type:'success',message:'Candidate job changed successfully'}};      
    }

    async updateCandidateStatus(candidateId: number, candidateStatusDto: CandidateStatusDto, user: User): Promise<object>{
        const { status } = candidateStatusDto;
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        await queryRunner.connect();

        const candidate = await candidateConnection.getRepository(Candidates).createQueryBuilder('candidate')
                                    .where('candidate.id = :id', {id: candidateId})
                                    .leftJoinAndSelect('candidate.jobs', 'jobs')
                                    .getOne();
        
        
        if(user.role.includes(UserRole.shortlister)){
           
            const userJobs = await candidateConnection.getRepository(User).createQueryBuilder('user')
                                    .innerJoinAndSelect('user.jobs', 'jobs')
                                    .where('user.id = :id', {id: user.id})
                                    .andWhere('jobs.id = :jobId', {jobId:candidate.jobs.id})
                                    .getOne();
           
            if(!userJobs){
                return {show:{type:'error', message:'You dont have permission for this operation'}}
            }
        }
        
        candidate.candidateStatus = status;
       
        await queryRunner.startTransaction();
        try{
            await candidateConnection.manager.save(candidate);
            await queryRunner.commitTransaction();        
        }catch(error){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        }finally{
            await queryRunner.release();
        }

        return {show:{type:'success',message:'Candidate status updated successfully'}}; 
    }

    async skipRound(candidateId: number): Promise<object>{
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        
        await queryRunner.connect();

        const candidate = await queryRunner.manager.findOne(Candidates, {
            relations: ['jobs','feedback'],
            where: {id: candidateId}
        });

        const currentRound = candidate.candidateStatus === CandidateStatus.shortlisted ? 1 : candidate.candidateStatus === CandidateStatus.inprogress ? candidate.currentRound + 1 : candidate.currentRound;

        if(candidate.candidateStatus === CandidateStatus.notShortlisted || candidate.candidateStatus === CandidateStatus.notSelected){
            return {show:{type:'error',message:'Candidate has not cleared the last round'}};
        }
        if(currentRound >= candidate.jobs.roundCount){
            return {show:{type:'error',message:'Cannot skip HR round'}};
        }

        const interviewSlots = await queryRunner.manager.findOne(InterviewSlots, {
            where: {candidate: candidateId, round: currentRound, interviewStatus: InterviewSlotStatus.scheduled}
        });

        const jobInterviewers = await queryRunner.manager.findOne(JobInterviewers, {
            where: {jobs: candidate.jobs.id, round: currentRound}
        });
        

        candidate.currentRound = currentRound;
        candidate.candidateStatus = CandidateStatus.inprogress;

        const feedback = new Feedback();
        feedback.round = currentRound;
        feedback.roundType = jobInterviewers.roundType;  
        feedback.interviewer = jobInterviewers.panelist.name;
        feedback.interviewMode = null;
        feedback.interviewDate = new Date();
        feedback.details = {};
        feedback.overallComment = "Skipped";
        feedback.overallRating = 0;
        feedback.status = CandidateStatus.skipped;
        feedback.candidate = candidate;
        feedback.jobId = candidate.jobs.id;
        let savedFeedback;

        await queryRunner.startTransaction();
        try{
            await candidateConnection.manager.save(candidate);
            savedFeedback = await candidateConnection.manager.save(feedback);
            if(interviewSlots){
                interviewSlots.interviewStatus = InterviewSlotStatus.skipped;
                await candidateConnection.manager.save(interviewSlots);
            }

            await queryRunner.commitTransaction();        
        }catch(error){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        }finally{
            await queryRunner.release();
        }
        const params = {
            candidateRound: currentRound,
            candidateStatus: candidate.candidateStatus,
            status: feedback.status,
            interviewDate: moment(feedback.interviewDate).format('YYYY-MM-DD'),
            createdAt: savedFeedback.createdAt,
            jobId: candidate.jobs.id
          };
        return {show:{type:'success',message:'Candidate round skipped successfully'},params};
    }

    async sendPanelistMail(panelistParams: any){
        const { frontendBaseUrl } = config.get('frontendserver');
        const { baseUrl } = config.get('backendserver');
        const {to, username, subject, template, feedbackLink, job, candidateName, interviewDate, interviewSlot, resume, sendFeedbackLink} = panelistParams;
        const request: EmailDto = {
            to: to,
            subject: subject,
            template: template,
            context: {
            feedbackLink: frontendBaseUrl+feedbackLink,
            job, candidateName, interviewDate, interviewSlot, username, sendFeedbackLink
            },
            attachments:[
                {
                filename : 'bottom_border@2x.png',
                path: baseUrl+'/assets/bottom_border@2x.png',
                cid : 'bottom_border@2x'
                },
                {
                filename : 'logo-color.png',
                path: baseUrl+'/assets/brigosha-logo@2x.png',
                cid : 'logo-color'
                },
                {
                filename : resume,
                path: resume,
                cid : 'resume'
                }
            ]

        }

        await this.mailerService.sendMail(request)
        .then((success) => {
            console.log(success);
        })
        .catch((err) => {
            console.log(err)
        });
    }

    async sendCandidateMail(candidateParams: any){
        const { baseUrl } = config.get('backendserver');
        const {to, username, subject, template, job, roundType, interviewDate, interviewSlot} = candidateParams;
        const request: EmailDto = {
            to: to,
            subject: subject,
            template: template,
            context: {
            username, job, roundType, interviewDate, interviewSlot
            },
            attachments:[
                {
                filename : 'bottom_border@2x.png',
                path: baseUrl+'/assets/bottom_border@2x.png',
                cid : 'bottom_border@2x'
                },
                {
                filename : 'logo-color.png',
                path: baseUrl+'/assets/brigosha-logo@2x.png',
                cid : 'logo-color'
                }
            ]

        }

        await this.mailerService.sendMail(request)
        .then((success) => {
            console.log(success);
        })
        .catch((err) => {
            console.log(err)
        });
    }

    async sendRescheduleMail(params: any){
        const { baseUrl } = config.get('backendserver');
        const {to, cc, username, subject, template, candidateName, job, interviewDate, interviewSlot} = params;
        const request: EmailDto = {
            to: to,
            cc: cc,
            subject: subject,
            template: template,
            context: {
            username, job, candidateName, interviewDate, interviewSlot
            },
            attachments:[
                {
                filename : 'bottom_border@2x.png',
                path: baseUrl+'/assets/bottom_border@2x.png',
                cid : 'bottom_border@2x'
                },
                {
                filename : 'logo-color.png',
                path: baseUrl+'/assets/brigosha-logo@2x.png',
                cid : 'logo-color'
                }
            ]
  
        }
  
        await this.mailerService.sendMail(request)
        .then((success) => {
            console.log(success);
        })
        .catch((err) => {
            console.log(err+' '+new Date());
        });
    } 

}
