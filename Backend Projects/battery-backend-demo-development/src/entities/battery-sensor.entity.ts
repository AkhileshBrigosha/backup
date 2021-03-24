import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

@Entity()
export class BatterySensor extends BaseEntity{
    
    @ObjectIdColumn()
    id: ObjectID;
    
    @Column()
    bsn: string;

    @Column()
    macId: string;
    
    @Column()
    mode: string;

    @Column()
    timeStamp: number;

    @Column()
    volatage: number;

    @Column()
    current: number;

    @Column()
    temperature: number;

    @Column()
    specificGravity: number;

    @Column()
    electrolyteLevel: number;

    @Column()
    levelCapacitance: number;
    
    @CreateDateColumn()
    createdAt: Date;
    
}