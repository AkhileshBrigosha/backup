import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn, JoinTable, OneToOne, CreateDateColumn } from 'typeorm';
import { HackathonTest } from './hackathon-tests.entity';
import { HackathonUser } from './hackathon-user.entity';

@Entity()
export class HackathonResult extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    totalMarks: number;

    @Column()
    attempted: number;

    @Column()
    correct: number;

    @Column()
    wrong: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(type => HackathonTest, test => test.testResult)
    test: HackathonTest;

    @OneToOne(type => HackathonUser, candidate => candidate.testResult)
    @JoinColumn()
    candidate: HackathonUser;

}
