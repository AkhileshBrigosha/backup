import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { HackathonResult } from './hackathon-results.entity';
import { CandidateStatus } from 'src/hackathon/enum/hackathon.enum';

@Entity()
export class HackathonUser extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'varchar', length: 12})
    phone: string

    @Column({type: 'varchar', length: 200, nullable: true})
    email: string

    @Column({nullable: true})
    score: string

    @Column({nullable: true})
    passYear: string

    @Column({type: "enum", enum: CandidateStatus, default: CandidateStatus.pending})
    status: CandidateStatus

    @Column({type: 'simple-array', nullable: true})
    programmingLangs: string[]

    @Column({type: 'simple-array', nullable: true})
    skills: string[]

    @OneToOne(type => HackathonResult, testResult => testResult.candidate)
    testResult: HackathonResult;
}
