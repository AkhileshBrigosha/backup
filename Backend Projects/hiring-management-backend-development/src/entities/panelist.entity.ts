import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Jobs } from './job-posting.entity';
import { PanelistStatus } from '../panelist/enum/panelist-enum';
import { JobInterviewers } from '../entities/job-interviewers.entity';
import { InterviewSlots } from '../entities/interview-slots.entity';
import { UserDesignation } from 'src/users/enums/user.enum';

@Entity()
export class Panelist extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'varchar', length: 150, unique: true})
    email: string;

    @Column({type: 'varchar', length: 15, unique: true})
    phone: string;

    @Column({type: 'enum', enum: UserDesignation, nullable: true})
    designation: UserDesignation;

    @Column({type: 'enum', enum: PanelistStatus, default: PanelistStatus.approved})
    status: PanelistStatus;

    @OneToMany(type => Schedule, schedule => schedule.panelist, {eager: true})
    schedule: Schedule[];

    @OneToMany(type => InterviewSlots, interviewSlots => interviewSlots.panelist)
    interviewSlots: InterviewSlots[];

    @OneToMany(type => Jobs, job => job.spoc, {eager: false})
    jobs: Jobs[];

    @OneToMany(type => JobInterviewers, jobInterviewers => jobInterviewers.panelist, {eager: false})
    jobInterviewers: JobInterviewers[];

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}