import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { TestType, HackathonStatus } from 'src/hackathon/enum/hackathon.enum';
import { HackathonQuestions } from './hackathon-questions.entity';
import { HackathonResult } from './hackathon-results.entity';

@Entity()
export class HackathonTest extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 50})
    title: string;

    @Column({type: "enum", enum: TestType})
    type: TestType

    @Column({nullable: true})
    totalPoints: number;

    @Column({type: "enum", enum: HackathonStatus, default: HackathonStatus.active})
    status: HackathonStatus;

    @Column({default: "Jan-2021"})
    session: string;

    @Column()
    startTime: Date

    @Column()
    duration: string;

    @OneToMany(type => HackathonQuestions, question => question.test)
    questions: HackathonQuestions[]

    @OneToMany(type => HackathonResult, testResult => testResult.test)
    testResult: HackathonResult[]
}
