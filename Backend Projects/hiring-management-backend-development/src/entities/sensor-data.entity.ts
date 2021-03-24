import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Sensor extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 100, nullable: true})
    name: string;

    @Column({type: 'json', nullable: true})
    accelerometer: object;

    @Column({type: 'json', nullable: true})
    gyroscope: object;

    @Column({type: 'json', nullable: true})
    magnetometer: object;

    @Column({type: 'json', nullable: true})
    barometer: object;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}
