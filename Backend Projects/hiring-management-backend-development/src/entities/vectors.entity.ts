import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Vectors extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'varchar', length: 100})
    course: string;

    @Column({type: 'varchar', length: 100})
    school: string;

    @Column({type: 'text'})
    address: string;

    @Column({type: 'varchar', length: 150, nullable: true})
    email: string;

    @Column({type: 'varchar', length: 15})
    phone: string;

    @Column({type: 'date', nullable: true})
    preferredExamDate: any;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}
