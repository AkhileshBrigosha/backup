import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePanelistDto } from './dto/create-panelist.dto';
import { Panelist } from '../entities/panelist.entity';
import { PanelistFilterDto } from './dto/panelist-filter.dto';
import { Schedule } from '../entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { getConnection, In } from 'typeorm';
import { PanelistStatus } from './enum/panelist-enum';
import * as moment from 'moment';
import { UserDesignation } from '../users/enums/user.enum';
import { JobInterviewers } from '../entities/job-interviewers.entity';
import { JobStatus } from '../job-posting/enum/job.enum';
import { InterviewSlots } from '../entities/interview-slots.entity';
import { InterviewSlotStatus } from 'src/recruitment/enum/recruitment.enum';
import { JobPostingService } from '../job-posting/job-posting.service';
import { Candidates } from '../entities/candidates.entity';
import { CandidateStatus } from 'src/candidates/enum/candidate.enum';

@Injectable()
export class PanelistService {
    constructor(
        private jobPostingService: JobPostingService
    ){}

    async getPanelist(schedule: boolean, panelistFilterDto: PanelistFilterDto): Promise<object>{
        const {search, status} = panelistFilterDto;
        const panelistConnection = getConnection('default');
        const query = panelistConnection.getRepository(Panelist).createQueryBuilder('panelist');
        if(search){
            query.where('(panelist.name LIKE :search OR panelist.email LIKE :search OR panelist.phone LIKE :search)', {search: `%${search}%`});
        }

        if(status){
            query.andWhere('(panelist.status = :status)', {status});
        }else{
            query.andWhere('(panelist.status = :status)', {status: PanelistStatus.approved});
        }

        if(schedule){
            query.leftJoinAndSelect('panelist.schedule', 'schedule');
        }
        
        const panelists = await query.orderBy('panelist.createdAt','DESC').getMany();
        
        
        
        const response = panelists.map(panelist => {
            const uniqueDays = {};
            if(panelist.schedule && panelist.schedule.length > 0){
                panelist.schedule.forEach(item => {
                    if(!Object.keys(uniqueDays).includes(item.weekday)){
                        uniqueDays[item.weekday] = [item];
                    }else{
                        uniqueDays[item.weekday].push(item);
                    }
                });
            }
            const temp = { ...panelist, ...{schedule: uniqueDays}};
            return temp;
        });


        return {panelists: response, designations: Object.values(UserDesignation)};
    }

    async getPanelistById(schedule: boolean, panelistId: number): Promise<object | Panelist>{
        const panelistConnection = getConnection('default');
        const query =  panelistConnection.getRepository(Panelist).createQueryBuilder('panelist');
        const week = moment().isoWeek();

        if(schedule){
            query.leftJoinAndSelect('panelist.schedule', 'schedule')
        }
        
        const panelist = await query.where('panelist.id = :panelistId', {panelistId}).getOne();

        if(!panelist){
            return {show:{type:'error',message:'No panelist found'}}
        }

        let uniqueDays = {};
        
        if(panelist.schedule && panelist.schedule.length > 0){
            panelist.schedule.map(item => {
                if(!Object.keys(uniqueDays).includes(item.weekday)){
                    uniqueDays[item.weekday] = [item];
                }else{
                    uniqueDays[item.weekday].push(item);
                }
            });
        }
       
        const response = {...panelist, ...{schedule: uniqueDays}}
        return response;
    }

    async updatePanelist(panelistId: number, createPanelistDto: CreatePanelistDto): Promise<object>{
       
        const { name, phone, email, designation, status} = createPanelistDto;
        const panelistConnection = getConnection('default');

        let panelist = await panelistConnection.manager.findOne(Panelist,{id: panelistId});
        
        if(!panelist){
            panelist = await new Panelist();
        }

        panelist.name = name;
        panelist.email = email.toLowerCase();
        panelist.phone = phone;
        panelist.designation = designation;
        panelist.status = status;

        try{
            await panelistConnection.manager.save(panelist);
        }catch(error){
            throw new InternalServerErrorException(error);
        }

        return {show:{type:'success',message:'Panelist saved successfully'}, panelist}; 
    }

    async deletePanelist(panelistId: number): Promise<any>{
       
        const panelistConnection = getConnection('default');
        const queryRunner = panelistConnection.createQueryRunner();
        await queryRunner.connect();  

        let panelist = await queryRunner.manager.findOne(Panelist,{id: panelistId});
      
        if(!panelist){
            return {show:{type:'error',message:'Panelist not found'}}; 
        }

        const jobInterviewers = await panelistConnection.getRepository(JobInterviewers).createQueryBuilder('interviewer')
                                        .innerJoin('interviewer.jobs', 'jobs')
                                        .where('jobs.status != :status', {status: JobStatus.deleted})
                                        .andWhere('interviewer.panelist = :panelistId', {panelistId})
                                        .getMany();
        
        if(jobInterviewers && jobInterviewers.length > 0){
            return {show:{type:'error',message:'Panelist is present in some job, remove him/her from job interivewer'}}; 
        }

        panelist.status = PanelistStatus.deleted;
       
        const schedules = await queryRunner.manager.find(Schedule,{
            where: [{panelist: panelistId}]
        });
       

        await queryRunner.startTransaction();
        
        try{
            await queryRunner.manager.save(panelist);
            if(schedules.length > 0){
                await this.cancelInterviewSlots(schedules);
                await queryRunner.manager.remove(schedules);
            }    
            await queryRunner.commitTransaction();
        }catch(error){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        }finally{
            await queryRunner.release();
        }

        // this.sendRescheduleMail(interviewSlots);

        return {show:{type:'success',message:'Panelist deleted successfully'}}; 
    }


    async updateSchedule(createScheduleDto: CreateScheduleDto): Promise<object>{

            const { panelistId, schedules, deleted} = createScheduleDto;
            const panelistConnection = getConnection('default');
            const queryRunner = panelistConnection.createQueryRunner();
            await queryRunner.connect();    
            
            const panelist = await queryRunner.manager.findOne(Panelist, {id: panelistId});
            
            if(!panelist){
                return {show:{type:'error',message:'Invalid Panelist Id'}}
            }
            
            await queryRunner.startTransaction();
            
            try{ 
                
                for(const item of schedules){
                    
                    let schedule = await queryRunner.manager.findOne(Schedule, {id: item.id});

                    if(!schedule){
                        schedule = new Schedule()
                    }
                    schedule.weekday = item.weekday;
                    schedule.startTime = item.startTime;
                    schedule.endTime = item.endTime;
                    schedule.panelist = panelist;
                    schedule.startTimeZone = moment(item.startTime, 'HH:mm a').format('HH:mm:ss');
                    schedule.endTimeZone = moment(item.endTime, 'HH:mm a').format('HH:mm:ss');
                    await queryRunner.manager.save(schedule);

                }
                
                if(deleted && deleted.length > 0){
                   const deletedSchedule = await queryRunner.manager.find(Schedule,{id: In(deleted)});
                   await this.cancelInterviewSlots(deletedSchedule);
                   await queryRunner.manager.remove(deletedSchedule);
                }

                await queryRunner.commitTransaction();
            }catch(e){
                await queryRunner.rollbackTransaction();
                throw new InternalServerErrorException(e);
            }finally{
                await queryRunner.release();
            }
            
            // this.sendRescheduleMail(interviewSlots);
            
            return {show:{type:'success',message:'Schedule saved successfully'}}
    }

    async cancelInterviewSlots(schedules: any){
        const panelistConnection = getConnection('default');
        const queryRunner = panelistConnection.createQueryRunner();
        await queryRunner.connect();  

        const scheduleIds = schedules.map(schedule => schedule.id);

        const candidateSlots = await panelistConnection.getRepository(InterviewSlots).createQueryBuilder('slots')
                                                        .leftJoinAndSelect('slots.candidate', 'candidate')
                                                        .leftJoinAndSelect('candidate.jobs', 'jobs')
                                                        .leftJoinAndSelect('candidate.agency','agency')
                                                        .leftJoinAndSelect('agency.users', 'users')
                                                        .where('slots.schedule IN (:...scheduleIds)', {scheduleIds})
                                                        .andWhere('slots.date >= :date', {date: new Date()})
                                                        .andWhere('slots.interviewStatus = :status', {status: InterviewSlotStatus.scheduled})
                                                        .getMany();
        const interviewSlots = candidateSlots;
        await queryRunner.startTransaction();
        try{
            for(const candidateSlot of candidateSlots){
                
                candidateSlot.interviewStatus = InterviewSlotStatus.cancelled;

                const candidate = await queryRunner.manager.findOne(Candidates, {
                    where: {id: candidateSlot.candidate.id}
                })

                candidate.candidateStatus = candidateSlot.candidate.currentRound == 1 ? CandidateStatus.shortlisted : CandidateStatus.inprogress;
                candidate.currentRound = candidateSlot.candidate.currentRound > 0 ? candidateSlot.candidate.currentRound - 1 : candidateSlot.candidate.currentRound;

                await queryRunner.manager.save(candidateSlot);
                await queryRunner.manager.save(candidate);
                await queryRunner.commitTransaction();
            }
        }catch(e){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }
        
        return interviewSlots;
    }

}