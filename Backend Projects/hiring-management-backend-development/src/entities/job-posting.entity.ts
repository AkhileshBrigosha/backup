import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Panelist } from './panelist.entity';
import { JobStatus, JobLocation, JobType, JobPriority } from '../job-posting/enum/job.enum';
import { Agency } from './agency.entity';
import { Candidates } from '../entities/candidates.entity';
import { JobInterviewers } from './job-interviewers.entity';
import { User } from '../entities/user.entity';
import { Feedback } from './feedback.entity';

@Entity()   
export class Jobs extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 100})
    title: string;
  
    @Column({type: 'enum', enum: JobLocation, array: true})
    location: JobLocation[];

    @Column({type: 'enum', enum: JobType})
    jobType: JobType;

    @Column({type: "text", nullable: true})
    description: string;

    @Column({type: "text", array: true, default: {}})
    keywords: string[];
   
    @Column({type: 'int2', default: 0})
    vacancies: number;

    @Column({type: 'enum', enum: JobPriority})
    priority: JobPriority;

    @Column({type: 'int2', default: 0})
    minExperience: number;

    @Column({type: 'int2', default: 0})
    maxExperience: number;

    @Column({type: 'int2', default: 0})
    noticePeriod: number;      
    
    @Column({type:'enum', enum: JobStatus, default: JobStatus.active})
    status: JobStatus;

    @Column({type: 'int2', default: 0})
    roundCount: number;
    
    @ManyToOne(type => Panelist, spoc => spoc.jobs, {eager: true})
    spoc: Panelist;

    @OneToMany(type => JobInterviewers, jobInterviewers => jobInterviewers.jobs, {eager:true})
    jobInterviewers: JobInterviewers[];

    @ManyToMany(type => Agency, agency => agency.jobs)
    @JoinTable({name: 'job_agency_table'})
    agencies: Agency[];

    @OneToMany(type => Candidates, candidates => candidates.jobs)
    candidates: Candidates[];

    @ManyToOne(type => User, shortlister => shortlister.jobs)
    shortlister: User;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}