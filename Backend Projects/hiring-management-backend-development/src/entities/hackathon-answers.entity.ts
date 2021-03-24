import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { HackathonTest } from './hackathon-tests.entity';
import { HackathonQuestions } from './hackathon-questions.entity';

@Entity()
export class HackathonAnswers extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    answer: string;

    @Column({nullable: true})
    correct: Boolean;

    @ManyToOne(type => HackathonQuestions, question => question.studentAns)
    question: HackathonQuestions

}
