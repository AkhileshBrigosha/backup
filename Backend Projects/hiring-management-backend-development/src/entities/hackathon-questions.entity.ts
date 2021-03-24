import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AgencyStatus } from '../users/enums/agency.enum';
import { Jobs } from './job-posting.entity';
import { Candidates } from '../entities/candidates.entity';
import { TestType, QType } from 'src/hackathon/enum/hackathon.enum';
import { HackathonTest } from './hackathon-tests.entity';
import { HackathonAnswers } from './hackathon-answers.entity';

@Entity()
export class HackathonQuestions extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'text', nullable: true})
    question: string;

    @Column({type: "enum", enum: QType})
    type: QType

    @Column({default: 3})
    positive: number;

    @Column({default: -1})
    negative: number;

    @Column('simple-array',{nullable: true})
    options: string[]

    @Column({nullable: true})
    answer: string

    @ManyToOne(type => HackathonTest, test => test.questions)
    test: HackathonTest

    @OneToMany(type => HackathonAnswers, studentAns => studentAns.question)
    studentAns: HackathonTest[];

}
