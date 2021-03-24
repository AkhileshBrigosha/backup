import { Injectable } from '@nestjs/common';
import { Jobs } from 'src/entities/job-posting.entity';
import { JobStatus } from 'src/job-posting/enum/job.enum';
import { getConnection } from 'typeorm';

@Injectable()
export class PublicApiService {

    async getAllActiveJobs(){
        const jobConnection = getConnection('default');

        const query = jobConnection.getRepository(Jobs).createQueryBuilder('jobs');
        
        query.where('jobs.status = :status', {status: JobStatus.active}); 

        const jobs = await query.orderBy('jobs.createdAt', 'DESC')
                                .getMany();
        return jobs;
    }

    async getJobById(jobId: number){
        const jobConnection = getConnection('default');

        const query = jobConnection.getRepository(Jobs).createQueryBuilder('jobs');
        
        query.where('jobs.id = :jobId', {jobId})
            .andWhere('jobs.status = :status', {status: JobStatus.active}); 

        const job = await query.getOne()
        return job;
    }
}
