import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JobDescriptionDto } from './dto/job-description.dto';
import { Jobs } from '../entities/job-posting.entity';
import { JobFilterDto } from './dto/job-filter.dto';
import { User } from '../entities/user.entity';
import { Panelist } from '../entities/panelist.entity';
import { getConnection, In, Not } from 'typeorm';
import { JobStatus, JobLocation, JobRoundType, JobType, JobPriority } from './enum/job.enum';
import { Agency } from '../entities/agency.entity';
import { JobInterviewers } from '../entities/job-interviewers.entity';
import { AgencyStatus } from '../users/enums/agency.enum';
import { PanelistStatus } from 'src/panelist/enum/panelist-enum';
import { UserRole } from '../users/enums/user.enum';
import { InterviewSlots } from '../entities/interview-slots.entity';
import { Candidates } from '../entities/candidates.entity';
import { InterviewSlotStatus } from 'src/recruitment/enum/recruitment.enum';
import { MailerService } from '@nestjs-modules/mailer';
import * as config from 'config';
import * as PdfPrinter from 'pdfmake'
import { CandidateStatus } from 'src/candidates/enum/candidate.enum';
const fs = require('fs');
const jsdom = require("jsdom");

@Injectable()
export class JobPostingService {
    constructor(
        private readonly mailerService: MailerService,
    ){}

    async getJobsForAdmin(jobFilterDto: JobFilterDto, user: User): Promise<object>{
                
        const {search, status} = jobFilterDto;
        const jobConnection = getConnection('default');

        const query = jobConnection.getRepository(Jobs).createQueryBuilder('jobs');
        
        if(user.role.length == 1 && user.role.includes(UserRole.shortlister)){
            query.andWhere('jobs.shortlister = :userId', {userId: user.id});
        }

        if(status){            
            query.andWhere('jobs.status = :status', {status});          
        }else{
            query.andWhere('jobs.status IN (:...status)', {status: [JobStatus.active, JobStatus.deactive]}); 
        }
        if(search){
            query.andWhere('(jobs.title LIKE :search)', {search: `%${search}%`});
        }
        
        query.leftJoinAndSelect('jobs.agencies', 'agency');

        const jobs = await query.leftJoinAndSelect("jobs.spoc", "spoc")
                                .leftJoinAndSelect("jobs.jobInterviewers", "interviewers")
                                .leftJoinAndSelect("interviewers.panelist", "panelist")
                                .leftJoinAndSelect("jobs.shortlister", "shortlister")
                                .orderBy('jobs.createdAt', 'DESC')
                                .getMany();

        const panelists = await jobConnection.getRepository(Panelist).find({select: ["id", "name", "phone", "email"],
                                                                            where:{status: PanelistStatus.approved},
                                                                            order: {
                                                                                createdAt: "DESC"
                                                                            }    
                                                                        });
        const agencies = await jobConnection.getRepository(Agency).find({select: ["id", "agencyName"],
                                                                        where: {status: AgencyStatus.approved, id: Not(1)},
                                                                        order: {
                                                                            createdAt: "DESC"
                                                                        }  
                                                                    })
        const shortlister =  await jobConnection.getRepository(User).createQueryBuilder('user')
                                                .where('user.role && ARRAY[:...role::user_role_enum]', {role: [UserRole.shortlister]})
                                                .select(['user.id', 'user.name', 'user.phone', 'user.email'])
                                                .orderBy('user.createdAt', 'DESC')
                                                .getMany();

        return {jobs, panelists, agencies, locations: Object.values(JobLocation), jobTypes: Object.values(JobType), roundTypes: Object.values(JobRoundType), shortlister, priorities: Object.values(JobPriority)};
        
    }

    async getJobsForAgency(jobFilterDto: JobFilterDto, user: User): Promise<object>{
        const {search} = jobFilterDto;
        const jobConnection = getConnection('default');

        const userDetails = await jobConnection.getRepository(User).findOne({
            relations: ["agency"],
            where: {id: user.id}
        });

        if(!userDetails.agency){
            return {message:{type:'error', message: 'No agency assigned to user'}}
        }

        const query = jobConnection.getRepository(Jobs).createQueryBuilder('jobs');
        
        query.leftJoinAndSelect('jobs.agencies', 'agency')
            .where("agency.id = :agencyId", { agencyId: userDetails.agency.id })
            .andWhere('jobs.status = :status', {status: JobStatus.active});

        if(search){
            query.andWhere('(jobs.title LIKE :search)', {search: `%${search}%`});
        }
        

        const jobs = await query.leftJoinAndSelect("jobs.spoc", "spoc")
                                .orderBy('jobs.createdAt', 'DESC')
                                .getMany();
        

        return {jobs, locations: Object.values(JobLocation)};
    }

    async getJobsById(jobId: number, user: User): Promise<object>{
        
        const jobConnection = getConnection('default');

        const query = jobConnection.getRepository(Jobs).createQueryBuilder('jobs');
        
        query.where('jobs.id = :jobId', {jobId});
        query.leftJoinAndSelect('jobs.agencies', 'agency')
            .leftJoinAndSelect("jobs.jobInterviewers", "interviewers") 
            .leftJoinAndSelect("interviewers.panelist", "panelist")
            .leftJoinAndSelect("jobs.spoc", "spoc")
            .leftJoinAndSelect("jobs.shortlister", "shortlister"); 
        
        const job = await query.getOne()

        return job;
    }

    async updateJob(jobId: number, jobDescriptionDto: JobDescriptionDto, user: User): Promise<object>{
        const {title, location, description, jobType, priority, keywords, vacancies, minExperience, maxExperience, noticePeriod, jobInterviewers, spoc, agencies,
                shortlister, status, deleted, edited ,roundCount} = jobDescriptionDto;

        const jobConnection = getConnection('default');
        const queryRunner = jobConnection.createQueryRunner();
        await queryRunner.connect();

        let getAgencies;
        if(agencies && agencies.length > 0){
            getAgencies = await queryRunner.manager.find(Agency,{id: In(agencies)});
        }
        const getSpoc = await queryRunner.manager.findOne(Panelist,{id: spoc});
        const getShortlister = await queryRunner.manager.findOne(User,{id: shortlister});
        
        let job = await queryRunner.manager.findOne(Jobs,{id: jobId});
        
        if(!job){
            job = new Jobs();
        }

        job.title = title;
        job.location = location;
        job.description = description;
        job.jobType = jobType,
        job.priority = priority,
        job.keywords = keywords;
        job.vacancies = vacancies;
        job.minExperience = minExperience;
        job.maxExperience = maxExperience;
        job.noticePeriod = noticePeriod;
        job.spoc = getSpoc;
        job.status = status;
        job.agencies = getAgencies ? getAgencies : null;
        job.shortlister = getShortlister;
        job.roundCount = roundCount;

        let savedJob;
        let interviewSlots;
        await queryRunner.startTransaction();
        try{
            savedJob = await queryRunner.manager.save(job);
            
            if((deleted && deleted.length > 0) || (edited && edited.length > 0)){
                const mergedIds = [...new Set([...deleted,...edited])];


                const interviewSchedules = await jobConnection.getRepository(InterviewSlots).createQueryBuilder('slots')
                                                                .leftJoinAndSelect("slots.schedule", "schedule")
                                                                .leftJoinAndSelect("slots.candidate", "candidate")
                                                                .leftJoinAndSelect("candidate.agency", "agency")
                                                                .leftJoinAndSelect("agency.users", "users")
                                                                .where('slots.interviewStatus = :status', {status: InterviewSlotStatus.scheduled})
                                                                .andWhere('slots.date >= :date', {date: new Date()})
                                                                .andWhere(qb1 => {
                                                                    const subQuery1 = qb1.subQuery()
                                                                                    .select('jobInterviewers.round')
                                                                                    .from(JobInterviewers, 'jobInterviewers')
                                                                                    .where('jobInterviewers.id IN (:...jobIds)', {jobIds: mergedIds})
                                                                                    .getQuery();
                                                                        return 'slots.round IN ' + subQuery1;
                                                                    })
                                                                .andWhere(qb2 => {
                                                                    const subQuery2 = qb2.subQuery()
                                                                                    .select('candidates.id')
                                                                                    .from(Candidates, 'candidates')
                                                                                    .where('candidates.jobs = :jobId', {jobId})
                                                                                    .getQuery();
                                                                        return 'slots.candidate IN ' + subQuery2;
                                                                    })
                                                                .getMany();
                
                
                interviewSlots = interviewSchedules;
              
                for(const interviewSchedule of interviewSchedules){
                    
                    const slots = await queryRunner.manager.findOne(InterviewSlots, {
                        where: {id: interviewSchedule.id}
                    })

                    slots.interviewStatus = InterviewSlotStatus.cancelled;
                    
                    const candidate = await queryRunner.manager.findOne(Candidates, {
                        where: {id: interviewSchedule.candidate.id}
                    })

                    candidate.candidateStatus = interviewSchedule.candidate.currentRound == 1 ? CandidateStatus.shortlisted : CandidateStatus.inprogress;
                    candidate.currentRound = interviewSchedule.candidate.currentRound > 0 ? interviewSchedule.candidate.currentRound - 1 : interviewSchedule.candidate.currentRound;

                    await queryRunner.manager.save(slots);
                    await queryRunner.manager.save(candidate);
                }
            }

            if(deleted && deleted.length > 0){
                const deletedInterviewers = await queryRunner.manager.find(JobInterviewers,{id: In(deleted)});
                await queryRunner.manager.remove(deletedInterviewers);
             }

            if(jobInterviewers && jobInterviewers.length > 0){
                for(const interview of jobInterviewers) {
                    const panelist = await queryRunner.manager.findOne(Panelist,{id: interview.panelistId});
                    if(!panelist){
                        return {show:{type:'error',message:'Invalid Panelist'}}
                    }
                       
                    let jobInterviews = await queryRunner.manager.findOne(JobInterviewers,{id: interview.id});
                    
                    if(!jobInterviews){
                        jobInterviews = new JobInterviewers();
                    }
                    jobInterviews.roundType = interview.roundType;
                    jobInterviews.round = interview.round;
                    jobInterviews.panelist = panelist;  
                    jobInterviews.jobs = savedJob;   
                    await queryRunner.manager.save(jobInterviews);
                };
            }
            
            await queryRunner.commitTransaction();
        }
        catch(e){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }

        if(jobId){
            return {show:{type:'success',message:'Job has been updated successfully'}, job: await this.getJobsById(jobId, user)}
        }
        return {show:{type:'success',message:'Job has been created successfully'}, job: await this.getJobsById(savedJob.id, user)}
    }

    async updateJobStatus(jobId: number, status: JobStatus): Promise<object>{
        const jobConnection = getConnection('default');
        const job = await jobConnection.manager.findOne(Jobs,{id:jobId});
        if(!job){
            return {show:{type:'error',message:'No job found'}};
        }

        job.status = status;
        try{
            await jobConnection.manager.save(job);
        }catch(error){
            throw new InternalServerErrorException(error);
        }

        return {show:{type:'success',message:'Job status updated successfully'}}
    }

    async generatePDF(jobId:number): Promise<object> {
       
        const { JSDOM } = jsdom;
        const { window } = new JSDOM("");
        const htmlToPdfMake = require("html-to-pdfmake");
        const jobConnection = getConnection('default');

        const job = await jobConnection.manager.findOne(Jobs,
            {
                relations: ['spoc'],
                where: {id: jobId}
            });

            const fonts = {
                Helvetica: {
                  normal: 'Helvetica',
                  bold: 'Helvetica-Bold',
                  italics: 'Helvetica-Oblique',
                  bolditalics: 'Helvetica-BoldOblique'
                }
              };
        const printer = new PdfPrinter(fonts);
        const docDefinition = {defaultStyle: {font: 'Helvetica'},
            content: [
                    `Job Title:        ${job.title}`,
                    `Vacancies:     ${job.vacancies}`,
                    `Experience:    ${job.maxExperience} -${job.minExperience} Years`,
                    `Notice Period: ${job.noticePeriod} Days`,
                    `Contact:       ${job.spoc.name}  (${job.spoc.email})  (${job.spoc.phone})`,
                    `Location:      ${job.location}`,
                    htmlToPdfMake(`Description: ${job.description}`, {window:window})
                     ]
                };
            
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
              pdfDoc.pipe(fs.createWriteStream('public/temp/JD'+ jobId + '.pdf'));
              pdfDoc.end();
        const backendserver = config.get('backendserver');
        const fileURL = backendserver.baseUrl + '/temp/'+'JD'+jobId + '.pdf';

        return {fileURL};

      }
}
