import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Request extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int', default: null})
    userId: number;

    @Column({type: 'varchar', length: 10})
    method: string;

    @Column({type: 'varchar', length: 200})
    path: string;

    @Column({type: 'json', default: null})
    body: object;

    @Column({type: 'json', default: null})
    error: object;

    @CreateDateColumn()
    createdAt: object;
}