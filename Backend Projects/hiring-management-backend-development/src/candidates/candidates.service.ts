import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CandidateDescriptionDto } from './dto/candidate-create.dto';
import { User } from '../entities/user.entity';
import { Candidates } from '../entities/candidates.entity';
import { getConnection } from 'typeorm';
import { UserRole } from '../users/enums/user.enum';
import { InterviewMode, InterviewSlotStatus } from '../recruitment/enum/recruitment.enum';
import { Jobs } from '../entities/job-posting.entity';
import { InterviewSlots } from '../entities/interview-slots.entity';
import { JobInterviewers } from '../entities/job-interviewers.entity';
import * as moment from 'moment';
import { Agency } from '../entities/agency.entity';
import { CandidateFilterDto, CandidateFilterDtoHistory } from './dto/candidate-filter.dto';
import { JobStatus } from '../job-posting/enum/job.enum';
import * as CryptoJS from 'crypto-js';
import * as config from 'config';
import * as AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
import { CandidateStatus, CandidateFilter } from './enum/candidate.enum';
import { CandidateFlagDto } from './dto/candidate-flag.dto';
const {s3Url} = config.get('aws');


const { accessKey, secretKey, bucketName, region } = config.get('aws');
const S3 = new AWS.S3({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: region
});

@Injectable()
export class CandidatesService {
    constructor(
    ){}

    async getAgency(jobId?: number){
        const candidateConnection = getConnection('default');
        const query = candidateConnection.getRepository(Agency).createQueryBuilder('agency')
                                    .leftJoinAndSelect("agency.jobs", "jobs")
                                    .select(["agency.id", "agency.agencyName"]);
        if(jobId){
            query.where("jobs.id = :jobId", {jobId});
        }
        query.orWhere("agency.id = :agencyId", {agencyId: 1});
                                    
        const agencyDropdown = await query.orderBy("agency.createdAt","DESC")
                                    .getMany();

        return agencyDropdown;
    }

    async getJobs(user: User, agencyId?: number){
        const candidateConnection = getConnection('default');
        const query = candidateConnection.getRepository(Jobs).createQueryBuilder('jobs')
                                            .where('jobs.status != :status', {status: JobStatus.deleted});
            
        if(user.role.length === 1 && user.role.includes(UserRole.shortlister)){
            query.where('jobs.shortlister = :userId', {userId: user.id});
        }
       
        if(agencyId){
             query.innerJoin('jobs.agencies', 'agency')
                .where('agency.id = :agencyId', {agencyId})
                .andWhere('jobs.status = :status', {status: JobStatus.active});
        }else{
            query.andWhere('jobs.status != :status', {status: JobStatus.deleted});
        }
        
        const jobsDropdown = await query.leftJoinAndSelect('jobs.jobInterviewers', 'jobInterviewers')
                                    .orderBy("jobs.createdAt","DESC")
                                    .getMany();
        
        return jobsDropdown;
    }

    async getCandidateById(jobId: number, candidateId: number, user: User): Promise<object>{
        const candidateConnection = getConnection('default');

        const userDetails = await candidateConnection.getRepository(User).findOne({
            relations: ["agency"],
            where: {id: user.id}
        });

        const query = candidateConnection.getRepository(Candidates).createQueryBuilder('candidates');

        if(user.role.includes(UserRole.agency)){
            query.where('candidates.agency = :agencyId', {agencyId: userDetails.agency.id})
                .andWhere('candidates.jobs = :jobId', {jobId: jobId});
        }else{
            query.where('candidates.jobs = :jobId', {jobId: jobId})
        }
        query.andWhere('candidates.id = :candidateId', {candidateId: candidateId})

        const candidate = await query.getOne();

        return candidate;
    }

    async getAllCandidatesForAdmin(candidateFilterDto: CandidateFilterDto, user: User): Promise<object>{
        const {jobId, agencyId, search, round, dateRange, status} = candidateFilterDto;
        const { key } = config.get('cipher');
        const candidateConnection = getConnection('default');
        const query = candidateConnection.getRepository(Candidates).createQueryBuilder('candidates')
                                            .leftJoinAndSelect('candidates.jobs', 'jobs') 
                                            .leftJoinAndSelect('candidates.agency', 'agency')  
        if(jobId){
            query.andWhere('jobs.id = :jobId', {jobId});
        }
        
        if(agencyId){
            query.andWhere('agency.id = :agencyId', {agencyId});
        }
        
        if(search){
            query.andWhere('(candidates.name LIKE :search OR candidates.email LIKE :search OR candidates.phone LIKE :search)', {search: `%${search}%`})
        }
        if(round >= 0){
            query.andWhere('candidates.currentRound = :round', {round})
        }
        if(status){
            if(status === CandidateFilter.ongoing){
                query.andWhere('candidates.candidateStatus NOT IN (:...status)', {status: [CandidateStatus.new, CandidateStatus.notSelected, CandidateStatus.notShortlisted]});
            }else if(status === CandidateFilter.rejected){
                query.andWhere('candidates.candidateStatus IN (:...status)', {status: [CandidateStatus.notSelected, CandidateStatus.notShortlisted]});
            }else{
                query.andWhere('candidates.candidateStatus  = :status', {status});
            }
        }
        if(dateRange){
            const dateArray = dateRange.split("/");
            const endDate = moment(dateArray[1], 'Y-M-DD').add(1, 'days').format('Y-M-DD');
            query.andWhere('candidates.createdAt >= :startDate', {startDate: dateArray[0]})
                    .andWhere('candidates.createdAt < :endDate', {endDate});
        }

        const candidatesRaw = await query.leftJoinAndSelect('candidates.interviewSlots', 'interviewSlots', 'interviewSlots.round = candidates.currentRound')
                                        .leftJoinAndSelect('interviewSlots.schedule', 'interviewSchedule')
                                        .leftJoinAndSelect('candidates.feedback', 'feedback')
                                        .orderBy('candidates.createdAt', 'DESC').getMany();
        
        let candidates;
        if(user.role.includes(UserRole.admin) || user.role.includes(UserRole.superAdmin)){
            candidates = candidatesRaw.map(candidate => {
                candidate.currentCtc = candidate.currentCtc ? CryptoJS.AES.decrypt(candidate.currentCtc, key).toString(CryptoJS.enc.Utf8) : null;
                candidate.expectedCtc = candidate.expectedCtc ? CryptoJS.AES.decrypt(candidate.expectedCtc, key).toString(CryptoJS.enc.Utf8) : null;
                return candidate;
            })
        }else{
            candidates = candidatesRaw.map(candidate => {
                candidate.currentCtc = 'NA';
                candidate.expectedCtc = 'NA';
                return candidate;
            })
        }
        
        return {
            "candidates": jobId ? candidates : [],
            "agencies": await this.getAgency(jobId),
            "jobs": await this.getJobs(user),
            "candidateStatus": CandidateStatus,
            "candidateTabStatus": [CandidateFilter.new, CandidateFilter.ongoing, CandidateFilter.rejected],
            "candidateOngoingStatus": [CandidateFilter.shortlisted, CandidateFilter.scheduled, CandidateFilter.inprogress, CandidateFilter.selected, CandidateFilter.hold],
            "candidateRejectedStatus": [CandidateFilter.notSelected, CandidateFilter.notShortlisted],
            "interviewMode": InterviewMode
        }
    }

    async getAllCandidatesForAgency(candidateFilterDto: CandidateFilterDto, user: User): Promise<object>{
        const {jobId, search, round, dateRange, status} = candidateFilterDto;
        const { key } = config.get('cipher');
        const candidateConnection = getConnection('default');
        
        const userDetails = await candidateConnection.getRepository(User).findOne({
            relations: ["agency"],
            where: {id: user.id}
        });

        if(!userDetails.agency){
            return {message:{type:'error', message: 'No agency assigned to user'}}
        }

        const query = candidateConnection.getRepository(Candidates).createQueryBuilder('candidates');

        query.innerJoinAndSelect('candidates.agency', 'agency')
                .where('agency.id = :agencyId', {agencyId: userDetails.agency.id});

        if(jobId){
            query.leftJoinAndSelect('candidates.jobs', 'jobs')
                .andWhere('jobs.id = :jobId', {jobId});
        }   
        
        if(search){
            query.andWhere('(candidates.name LIKE :search OR candidates.email LIKE :search OR candidates.phone LIKE :search)', {search: `%${search}%`})
        }
        if(round >= 0){
            query.andWhere('candidates.currentRound = :round', {round})
        }
        if(status){
            if(status === CandidateFilter.ongoing){
                query.andWhere('candidates.candidateStatus NOT IN (:...status)', {status: [CandidateStatus.new, CandidateStatus.notSelected, CandidateStatus.notShortlisted]});
            }else if(status === CandidateFilter.rejected){
                query.andWhere('candidates.candidateStatus IN (:...status)', {status: [CandidateStatus.notSelected, CandidateStatus.notShortlisted]});
            }else{
                query.andWhere('candidates.candidateStatus  = :status', {status});
            }
        }

        if(dateRange){
            const dateArray = dateRange.split("/");
            const endDate = moment(dateArray[1], 'Y-M-DD').add(1, 'days').format('Y-M-DD');
            query.andWhere('candidates.createdAt >= :startDate', {startDate: dateArray[0]})
                    .andWhere('candidates.createdAt < :endDate', {endDate});
        }

        const candidatesRaw = await query.leftJoinAndSelect('candidates.interviewSlots', 'interviewSlots', 'interviewSlots.round = candidates.currentRound')
                                        .leftJoinAndSelect('interviewSlots.schedule', 'interviewSchedule')
                                        .leftJoinAndSelect('candidates.feedback', 'feedback')
                                        .orderBy('candidates.createdAt', 'DESC').getMany();
        
        const candidates = candidatesRaw.map(candidate => {
            candidate.currentCtc = candidate.currentCtc ? CryptoJS.AES.decrypt(candidate.currentCtc, key).toString(CryptoJS.enc.Utf8) : null;
            candidate.expectedCtc = candidate.expectedCtc ? CryptoJS.AES.decrypt(candidate.expectedCtc, key).toString(CryptoJS.enc.Utf8) : null;
            return candidate;
        })
        
        return {
            "candidates": jobId ? candidates : [],
            "jobs": await this.getJobs(user, userDetails.agency.id),
            "candidateStatus": CandidateStatus,
            "candidateTabStatus": [CandidateFilter.new, CandidateFilter.ongoing, CandidateFilter.rejected],
            "candidateOngoingStatus": [CandidateFilter.shortlisted, CandidateFilter.scheduled, CandidateFilter.inprogress, CandidateFilter.selected, CandidateFilter.hold],
            "candidateRejectedStatus": [CandidateFilter.notSelected, CandidateFilter.notShortlisted],
            "interviewMode": InterviewMode
        }
    }

    async getDuplicateCandidates(candidateId: number): Promise<object>{
        const candidateConnection = getConnection('default');
        const candidate = await candidateConnection.manager.findOne(Candidates, {id: candidateId});

        const duplicateCandidate = await candidateConnection.getRepository(Candidates).createQueryBuilder('candidates')
                                                            .where('(candidates.email LIKE :email OR candidates.phone LIKE :phone)', {email: `%${candidate.email}%`, phone:`%${candidate.phone}%`})
                                                            .leftJoinAndSelect('candidates.feedback', 'feedback')
                                                            .leftJoinAndSelect('candidates.agency','agency')
                                                            .leftJoinAndSelect('candidates.jobs','job')
                                                            .orderBy('candidates.createdAt','DESC')
                                                            .getMany();
        return duplicateCandidate;
    }

    async getSlotForCandidate(jobId: number, candidateId: number, user: User, date: string): Promise<object> {
        const candidateConnection = getConnection('default');
        
        const candidate = await this.getCandidateById(jobId,candidateId,user);
        
        const weekDay = moment(date).format('dddd');
        const query =   candidateConnection.getRepository(JobInterviewers).createQueryBuilder('query')
                        .leftJoinAndSelect('query.panelist', 'panelist')
                        .leftJoinAndSelect('panelist.schedule', 'schedule')
                        .where('query.jobs = :jobId', {jobId})
                        .andWhere('schedule.weekday = :weekDay', {weekDay});
        
        if(candidate['candidateStatus'] === CandidateStatus.shortlisted){
            query.andWhere('query.round = :round', {round: 1})
        }else if(candidate['candidateStatus'] === CandidateStatus.inprogress){
            query.andWhere('query.round = :round', {round: candidate['currentRound'] + 1})
        }else{
            query.andWhere('query.round = :round', {round: candidate['currentRound']})
        }
        const panelistSchedule = await query.getOne();
        
        const availableSlot = [];
        const selfBookedSlot = [];

        if(panelistSchedule){
            const bookedSlot = await candidateConnection.getRepository(InterviewSlots).createQueryBuilder('slots')
                                        .where('slots.date = :date', {date})
                                        .andWhere('slots.panelist = :panelistId', {panelistId: panelistSchedule.panelist.id})
                                        .andWhere('slots.interviewStatus = :status', {status: InterviewSlotStatus.scheduled})
                                        .leftJoinAndSelect('slots.schedule', 'schedule')
                                        .leftJoinAndSelect('slots.candidate', 'candidate')
                                        .getMany();

            const bookedSlotId = [];
            const selfBookSlotId = [];
            
            if(bookedSlot){
                bookedSlot.map(item => {
                    if(item.candidate.id === candidateId){
                        selfBookSlotId.push(item.schedule.id);
                    }else{
                        bookedSlotId.push(item.schedule.id);
                    }
                });
            }   
            
            if(panelistSchedule.panelist.schedule){
                panelistSchedule.panelist.schedule.map(item => {
                    if(!bookedSlotId.includes(item.id) && !selfBookSlotId.includes(item.id)){
                        availableSlot.push(item);
                    }
                    if(selfBookSlotId.includes(item.id)){
                        selfBookedSlot.push(item);
                    }
                });
            }                           
        }
             
        
        return {availableSlot,selfBookedSlot};
    }
   
    async createCandidate(user: User, candidateDescriptionDto: CandidateDescriptionDto, files: any): Promise<object>{
        
        const { name, phone, email, skypeId, experienceYears, experienceMonths, currentCompany, currentCtc, expectedCtc, currentLocation,
            preferredLocation, noticePeriod, jobId
            } = candidateDescriptionDto;
        const { key } = config.get('cipher');

        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        
        await queryRunner.connect();

        const job = await queryRunner.manager.findOne(Jobs, {id: jobId});
        
        const userDetails = await queryRunner.manager.findOne(User,{
            relations: ["agency"],
            where: {id: user.id}
        });
       
        if(!job || !userDetails.agency){
            return {show:{type:'error', message: 'Invalid JobId or Agency'}}
        }

        
        const candidate = new Candidates();
           

        let candidateResume, candidatePhoto;

        if(files !== undefined && Object.keys(files).length > 0){
            if(files.resume){
                candidateResume = await this.saveFile(files.resume, name);
            }
            if(files.candidatePhoto){
                candidatePhoto = await this.saveFile(files.candidatePhoto, name);
            }
        }
        
        const duplicateCandidate = await queryRunner.manager.find(Candidates,{
            where: [
                { phone: phone},
                { email: email }
              ]
        });

        if(duplicateCandidate.length > 0){
            candidate.duplicate = true;
        }
        
        candidate.name = name;
        candidate.email = email.toLowerCase();
        candidate.phone = phone;
        candidate.skypeId = skypeId;
        candidate.experienceYears = experienceYears;
        candidate.experienceMonths = experienceMonths;
        candidate.currentCompany = currentCompany;
        
        candidate.currentCtc = currentCtc ? CryptoJS.AES.encrypt(currentCtc, key).toString() : null;
        candidate.expectedCtc = expectedCtc ? CryptoJS.AES.encrypt(expectedCtc, key).toString() : null;
        
        candidate.currentLocation = currentLocation;
        candidate.preferredLocation = preferredLocation;
        candidate.noticePeriod = noticePeriod ? noticePeriod : 0;
        candidate.resume = candidateResume || candidate.resume;
        candidate.candidatePhoto = candidatePhoto || candidate.candidatePhoto;
        candidate.agency = userDetails.agency;
        candidate.jobs = job;
        candidate.candidateStatus = CandidateStatus.new;
        
        await queryRunner.startTransaction();

        try{
            await queryRunner.manager.save(candidate);
            await queryRunner.commitTransaction();
            
        }catch(e){
            if(candidateResume){
                await this.deleteFile(candidateResume);
            }
            if(candidatePhoto){
                await this.deleteFile(candidatePhoto);
            }
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }

        return {show: {type:'success', message:'Candidate submitted successfully'}}; 
    }

    async updateCandidate(candidateId: number, user: User, candidateDescriptionDto: CandidateDescriptionDto, files: any): Promise<object>{
        
        const { name, phone, email, skypeId, experienceYears, experienceMonths, currentCompany, currentCtc, expectedCtc, currentLocation,
            preferredLocation, noticePeriod, duplicate, blacklist, candidateStatus, jobId
            } = candidateDescriptionDto;
        const { key } = config.get('cipher');

        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        
        await queryRunner.connect();

        const job = await queryRunner.manager.findOne(Jobs, {id: jobId});
        
        const userDetails = await queryRunner.manager.findOne(User,{
            relations: ["agency"],
            where: {id: user.id}
        });
       
        if(!job || !userDetails.agency){
            return {show:{type:'error', message: 'Invalid JobId or Agency'}}
        }

        let candidate = await queryRunner.manager.findOne(Candidates, {id: candidateId});
        
        if(!candidate){
            return {show:{type:'error', message: 'Invalid Candidate ID'}}
        }

        let candidateResume, candidatePhoto;

        if(files !== undefined && Object.keys(files).length > 0){
            if(files.resume){
                await this.deleteFile(candidate.resume);
                candidateResume = await this.saveFile(files.resume, name);
            }
            if(files.candidatePhoto){
                await this.deleteFile(candidate.candidatePhoto);
                candidatePhoto = await this.saveFile(files.candidatePhoto, name);
            }
        }
        
        candidate.name = name;
        candidate.skypeId = skypeId;
        candidate.experienceYears = experienceYears;
        candidate.experienceMonths = experienceMonths;
        candidate.currentCompany = currentCompany;
        
        candidate.currentCtc = currentCtc ? CryptoJS.AES.encrypt(currentCtc, key).toString() : null;
        candidate.expectedCtc = expectedCtc ? CryptoJS.AES.encrypt(expectedCtc, key).toString() : null;
      
        candidate.currentLocation = currentLocation;
        candidate.preferredLocation = preferredLocation;
        candidate.noticePeriod = noticePeriod ? noticePeriod : 0;
        candidate.resume = candidateResume || candidate.resume;
        candidate.candidatePhoto = candidatePhoto || candidate.candidatePhoto;
        candidate.duplicate = duplicate !== null ? duplicate : candidate.duplicate;
        candidate.blacklist = blacklist;
        candidate.agency = userDetails.agency;
        candidate.jobs = job;
        
        await queryRunner.startTransaction();

        try{
            await queryRunner.manager.save(candidate);
            await queryRunner.commitTransaction();
            
        }catch(e){
            if(candidateResume){
                await this.deleteFile(candidateResume);
            }
            if(candidatePhoto){
                await this.deleteFile(candidatePhoto);
            }
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }

        return {show: {type:'success', message:'Candidate updated successfully'}}; 
    }

    async updateCandidateFlag(candidateId: number, candidateFlagDto: CandidateFlagDto): Promise<object>{
        
        const { duplicate, blacklist } = candidateFlagDto;
        
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        
        await queryRunner.connect();

        let candidate = await queryRunner.manager.findOne(Candidates, {id: candidateId});
        
        if(!candidate){
            return {show:{type:'error', message: 'Invalid Candidate ID'}}
        }

        candidate.duplicate = duplicate !== null ? duplicate : candidate.duplicate;
        candidate.blacklist = blacklist !== null ? blacklist : candidate.blacklist;
       
        await queryRunner.startTransaction();

        try{
            await queryRunner.manager.save(candidate);
            await queryRunner.commitTransaction();
            
        }catch(e){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }

        return {show: {type:'success', message:'Candidate flag updated successfully'}}; 
    }

    async deleteCandidate(candidateId: number, user: User): Promise<any>{
    }

    async saveFile(file: any, candidateName: string): Promise<any>{
        const params = {
            Body: file[0].buffer,
            ContentType: file[0].mimetype,
            Bucket: bucketName,
            Key: file[0].fieldname + '/' + candidateName  + '-' + uuidv4() + file[0].originalname,
            ACL: 'public-read'
        }
        const uploadedFile: any = await new Promise((resolve, reject) => {
            S3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                return {show:{type: 'error', message: 'Something went wrong, contact admin'}}
            }
            resolve(data);
            });
        });

        return uploadedFile.key;
    }

    async deleteFile(fileKey: string){
       
        const params = {
            Bucket: bucketName,
            Key: fileKey,
        }

        new Promise((resolve, reject) => {
            S3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err);
            }
            resolve(data);
            });
        });
    }
    
    async getAllCandidatesForAdminHistory(candidateFilterDto: CandidateFilterDtoHistory, user: User): Promise<object>{
        const {jobId, agencyId, search, round, dateRange, status} = candidateFilterDto;
        const { key } = config.get('cipher');
        const candidateConnection = getConnection('default');
        const query = candidateConnection.getRepository(Candidates).createQueryBuilder('candidates')
                                            .leftJoinAndSelect('candidates.jobs', 'jobs') 
                                            .leftJoinAndSelect('candidates.agency', 'agency')  
        if(jobId && jobId.length>0){
            query.andWhere('jobs.id IN (:...jobId)', {jobId});
        }
        
        if(agencyId && agencyId.length>0){
            query.andWhere('agency.id IN (:...agencyId)', {agencyId});
        }
        
        if(search){
            query.andWhere('(candidates.name LIKE :search OR candidates.email LIKE :search OR candidates.phone LIKE :search)', {search: `%${search}%`})
        }
        if(round >= 0){
            query.andWhere('candidates.currentRound = :round', {round})
        }
        if(status){
            if(status === CandidateFilter.ongoing){
                query.andWhere('candidates.candidateStatus NOT IN (:...status)', {status: [CandidateStatus.new, CandidateStatus.notSelected, CandidateStatus.notShortlisted]});
            }else if(status === CandidateFilter.rejected){
                query.andWhere('candidates.candidateStatus IN (:...status)', {status: [CandidateStatus.notSelected, CandidateStatus.notShortlisted]});
            }else{
                query.andWhere('candidates.candidateStatus  = :status', {status});
            }
        }
        if(dateRange){
            const dateArray = dateRange.split("/");
            const endDate = moment(dateArray[1], 'Y-M-DD').add(1, 'days').format('Y-M-DD');
            
            query.andWhere('candidates.createdAt >= :startDate', {startDate: dateArray[0]})
                    .andWhere('candidates.createdAt <  :endDate', {endDate});
        }

        const candidatesRaw = await query.leftJoinAndSelect('candidates.interviewSlots', 'interviewSlots', 'interviewSlots.round = candidates.currentRound')
                                        .leftJoinAndSelect('interviewSlots.schedule', 'interviewSchedule')
                                        .leftJoinAndSelect('candidates.feedback', 'feedback')
                                        .orderBy('candidates.createdAt', 'DESC').getMany();
        
        let candidates;
        if(user.role.includes(UserRole.admin) || user.role.includes(UserRole.superAdmin)){
            candidates = candidatesRaw.map(candidate => {
                candidate.currentCtc = candidate.currentCtc ? CryptoJS.AES.decrypt(candidate.currentCtc, key).toString(CryptoJS.enc.Utf8) : null;
                candidate.expectedCtc = candidate.expectedCtc ? CryptoJS.AES.decrypt(candidate.expectedCtc, key).toString(CryptoJS.enc.Utf8) : null;
                return candidate;
            })
        }else{
            candidates = candidatesRaw.map(candidate => {
                candidate.currentCtc = 'NA';
                candidate.expectedCtc = 'NA';
                return candidate;
            })
        }
        
        return {
            "candidates": jobId ? candidates : [],
            "agencies": await this.getAgencyHistory(jobId),
            "jobs": await this.getJobs(user),
            "candidateStatus": CandidateStatus,
            "candidateTabStatus": [CandidateFilter.new, CandidateFilter.ongoing, CandidateFilter.rejected],
            "candidateOngoingStatus": [CandidateFilter.shortlisted, CandidateFilter.scheduled, CandidateFilter.inprogress, CandidateFilter.selected, CandidateFilter.hold],
            "candidateRejectedStatus": [CandidateFilter.notSelected, CandidateFilter.notShortlisted],
            "interviewMode": InterviewMode
        }
    }

    async getAgencyHistory(jobId?: number[]){
        const candidateConnection = getConnection('default');
        const query = candidateConnection.getRepository(Agency).createQueryBuilder('agency')
                                    .leftJoinAndSelect("agency.jobs", "jobs")
                                    .select(["agency.id", "agency.agencyName"]);
        if(jobId){
            query.where('jobs.id IN (:...jobId)', {jobId});
        }
        query.orWhere("agency.id = :agencyId", {agencyId: 1});
                                    
        const agencyDropdown = await query.orderBy("agency.createdAt","DESC")
                                    .getMany();

        return agencyDropdown;
    }

    async updateCandidateComment(candidateId: number, comment: string): Promise<object>{
        
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        
        await queryRunner.connect();

        let candidate = await queryRunner.manager.findOne(Candidates, {id: candidateId});
        
        if(!candidate){
            return {show:{type:'error', message: 'Invalid Candidate ID'}}
        }

        candidate.comment=comment;
       
        await queryRunner.startTransaction();

        try{
            await queryRunner.manager.save(candidate);
            await queryRunner.commitTransaction();
            
        }catch(e){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }

        return {show: {type:'success', message:'Candidate comment updated successfully'}}; 
    }

    async updateCandidatePhoto(candidateId: number, files: any): Promise<object>{
        
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        
        await queryRunner.connect();

        let candidate = await queryRunner.manager.findOne(Candidates, {id: candidateId});
        
        if(!candidate){
            return {show:{type:'error', message: 'Invalid Candidate ID'}}
        }

        let candidatePhoto;

        if(files !== undefined && Object.keys(files).length > 0){
                if(candidate.candidatePhoto !== null){
                    await this.deleteFile(candidate.candidatePhoto);
                }
                candidatePhoto = await this.saveFile(files.candidatePhoto, candidate.name);
        }

        candidate.candidatePhoto = candidatePhoto;
       
        await queryRunner.startTransaction();
        try{
            await queryRunner.manager.save(candidate);
            await queryRunner.commitTransaction();
            
        }catch(e){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }        
        return {show:{type:'success', message: 'Candidate photo uploaded successfully'}, candidatePhoto: s3Url + candidatePhoto}; 
    }
}
