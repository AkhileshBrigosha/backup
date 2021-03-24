import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Panelist } from './panelist.entity';
import { Jobs } from './job-posting.entity';
import { JobRoundType } from '../job-posting/enum/job.enum';

@Entity()   
export class JobInterviewers extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int2'})
    round: number;

    @Column({type:'enum', enum:JobRoundType, default: JobRoundType.technical})
    roundType: JobRoundType;

    @ManyToOne(type => Panelist, panelist => panelist.jobInterviewers, {eager: true,cascade: true,onDelete :'SET NULL'})
    panelist: Panelist;

    @ManyToOne(type => Jobs, jobs => jobs.jobInterviewers, {eager:false})
    jobs: Jobs;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

}