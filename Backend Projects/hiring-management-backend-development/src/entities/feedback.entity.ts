import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { JobRoundType } from '../job-posting/enum/job.enum';
import { InterviewMode } from '../recruitment/enum/recruitment.enum';
import { Candidates } from '../entities/candidates.entity';
import { CandidateStatus } from 'src/candidates/enum/candidate.enum';
import { Jobs } from './job-posting.entity';

@Entity()
export class Feedback extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int2'})
    round: number;

    @Column({type: 'enum', enum: JobRoundType, nullable: true})
    roundType: JobRoundType;

    @Column({type: 'enum', enum: InterviewMode, nullable: true})
    interviewMode: InterviewMode;

    @Column({type: 'date' , nullable: true})
    interviewDate: Date;

    @Column({type: 'varchar', length: 100, nullable: true})
    interviewer: string;

    @Column({type: 'json'})
    details: object;

    @Column({type: 'text'})
    overallComment: string;

    @Column({type: 'int2'})
    overallRating: number;

    @Column({type: 'enum', enum: CandidateStatus, nullable: true})
    status: string;

    @Column({type: 'int'})
    jobId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(type => Candidates, candidate => candidate.feedback)
    candidate: Candidates;

}