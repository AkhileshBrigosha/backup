import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Panelist } from './panelist.entity';
import { Weekdays } from '../panelist/enum/schedule-enum';
import {  InterviewSlots } from '../entities/interview-slots.entity';

@Entity()
export class Schedule extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'enum', enum: Weekdays})
    weekday: Weekdays;

    @Column({type: 'varchar', length: 10})
    startTime: string;

    @Column({type: 'varchar', length: 10})
    endTime: string;

    @Column({type: 'time with time zone', nullable: true})
    startTimeZone: any;

    @Column({type: 'time with time zone', nullable: true})
    endTimeZone: any;

    @OneToMany(type => InterviewSlots, interviewSlots => interviewSlots.schedule)
    interviewSlots: InterviewSlots[];

    @ManyToOne(type => Panelist, panelist => panelist.schedule, {eager: false})
    panelist: Panelist;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}