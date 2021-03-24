import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FeedbackFormType } from '../feedback/enum/feedback.enum';

@Entity()
export class FeedbackQuestions extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({type:'enum', enum: FeedbackFormType, unique: true})
    feedbackType: FeedbackFormType;

    @Column({type: 'json'})
    questions: object;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}