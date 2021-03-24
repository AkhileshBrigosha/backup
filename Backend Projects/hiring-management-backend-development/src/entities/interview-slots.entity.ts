import { Candidates } from "../entities/candidates.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Schedule } from "../entities/schedule.entity";
import { Panelist } from "src/entities/panelist.entity";
import { InterviewMode, InterviewSlotStatus } from '../recruitment/enum/recruitment.enum';

@Entity()
export class InterviewSlots extends BaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'date', nullable: true})
    date: Date;

    @Column({type: 'int2', default: 1})
    round: number;

    @Column({type:'enum', enum:InterviewMode, default: InterviewMode.offline})
    interviewMode: InterviewMode;

    @Column({type:'enum', enum:InterviewSlotStatus, default: InterviewSlotStatus.scheduled})
    interviewStatus: InterviewSlotStatus;

    @Column({type: 'varchar', length: 50, nullable: true})
    googleCalenderId: string;

    @ManyToOne(type => Schedule, schedule => schedule.interviewSlots,{cascade: true,onDelete :'SET NULL'})
    schedule: Schedule;

    @ManyToOne(type => Candidates, candidate => candidate.interviewSlots)
    candidate: Candidates;

    @ManyToOne(type => Panelist, panelist => panelist.interviewSlots)
    panelist: Panelist;

    @CreateDateColumn()
    createdAt;
    
    @UpdateDateColumn()
    updatedAt;
}