import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, AfterLoad, OneToMany } from 'typeorm';
import { Agency } from './agency.entity';
import { Jobs } from './job-posting.entity';
import * as config from 'config';
import { InterviewSlots } from '../entities/interview-slots.entity';
import { Feedback } from './feedback.entity';
import { JobLocation } from '../job-posting/enum/job.enum';
import { CandidateStatus } from 'src/candidates/enum/candidate.enum';
@Entity()
export class Candidates extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'varchar', length: 150})
    email: string;

    @Column({type: 'varchar', length: 15})
    phone: string;

    @Column({type: 'varchar', length: 20, nullable: true})
    skypeId: string;

    @Column({type: 'int2'})
    experienceYears: number;

    @Column({type: 'int2', default: 0})
    experienceMonths: number;

    @Column({type: 'text', nullable: true})
    currentCompany: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    currentCtc: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    expectedCtc: string;

    @Column({type: 'text'})
    currentLocation: string;

    @Column({type:'enum', enum: JobLocation, nullable: true})
    preferredLocation: JobLocation;

    @Column({type: 'int2'})
    noticePeriod: number;

    @Column({type: 'text'})
    resume: string;

    @Column({type: 'text', nullable: true})
    candidatePhoto: string;

    @Column({type: 'boolean', default: false})
    duplicate: boolean;

    @Column({type: 'boolean', default: false})
    blacklist: boolean;

    @Column({type: 'varchar', length: 100, nullable: true})
    reference: string;

    @Column({type:'enum', enum: CandidateStatus, default: CandidateStatus.new})
    candidateStatus: CandidateStatus;

    @Column({default: 0})
    currentRound: number;

    @Column({type: 'text', nullable: true})
    comment: string;

    @ManyToOne(type => Agency, agency => agency.candidates)
    agency: Agency;

    @ManyToOne(type => Jobs, jobs => jobs.candidates)
    jobs: Jobs;

    @OneToMany(type => InterviewSlots, interviewSlots => interviewSlots.candidate)
    interviewSlots: InterviewSlots[];

    @OneToMany(type => Feedback, feedback => feedback.candidate)
    feedback: Feedback[];

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @AfterLoad()
    getFilePath() {
        const {s3Url} = config.get('aws');

        this.resume = s3Url + this.resume;
        if(this.candidatePhoto === null){
            this.candidatePhoto = null
        }else{
            this.candidatePhoto = s3Url + this.candidatePhoto;
        }
    }
}