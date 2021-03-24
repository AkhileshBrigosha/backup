import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

@Entity()
export class BatteryDiagnosis extends BaseEntity{
    
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
    noOfDiagnosis: number;

    @Column()
    payload: [];

    @CreateDateColumn()
    createdAt: Date;
    
}