import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { UserRole, UserStatus, UserDesignation } from '../users/enums/user.enum';
import { Agency } from './agency.entity';
import { Jobs } from '../entities/job-posting.entity';

@Entity()
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'varchar', length: 150, unique: true})
    email: string;

    @Column({type: 'varchar', length: 15, unique: true})
    phone: string;

    @Column({type: 'varchar', length: 200, nullable: true, select: false})
    password: string;

    @Column({type: 'varchar', length: 100, nullable: true, select: false})
    salt: string;

    @Column({type: 'varchar', length: 100, nullable: true, select: false})
    refreshToken: string;

    @Column({type: 'enum', enum: UserDesignation, nullable:true})
    designation: UserDesignation;

    @Column({type: "enum", enum: UserRole, array: true})
    role: UserRole[];

    @Column({type: "boolean", default: false})
    primaryContact: boolean

    @Column({type:'enum', enum: UserStatus})
    status: UserStatus;

    @Column({type: 'varchar', length: 100, nullable: true})
    passwordToken: string;

    @ManyToOne(type => Agency, agency => agency.users)
    agency: Agency;

    @OneToMany(type => Jobs, jobs => jobs.shortlister)
    jobs: Jobs[];

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

}