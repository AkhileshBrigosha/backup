import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { AgencyStatus } from '../users/enums/agency.enum';
import { Jobs } from './job-posting.entity';
import { Candidates } from '../entities/candidates.entity';

@Entity()
export class Agency extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 100})
    agencyName: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    location: string;

    @Column({type: 'enum', enum: AgencyStatus, default: AgencyStatus.approved})
    status: AgencyStatus;

    @Column({nullable: true})
    otherDetails: string;

    @OneToMany(type => User, user => user.agency)
    users: User[];

    @ManyToMany(type => Jobs, jobs => jobs.agencies)
    jobs: Jobs[];

    @OneToMany(type => Candidates, candidates => candidates.agency)
    candidates: Candidates[];

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}