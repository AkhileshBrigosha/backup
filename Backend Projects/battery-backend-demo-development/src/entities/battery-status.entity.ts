import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

@Entity()
export class BatteryStatus extends BaseEntity{
    
    @ObjectIdColumn()
    id: ObjectID;
    
    @Column()
    bsn: string;

    @Column()
    macId: string;
    
    @Column()
    batteryState: string;

    @Column()
    timeStamp: number;

    @Column()
    cycleCount: number;

    @Column()
    ahin: number;

    @Column()
    ahout: number;

    @Column()
    SOC: number;

    @Column()
    TTE: number;

    @Column()
    TotalPenalty: number;
    
    @CreateDateColumn()
    createdAt: Date;
    
}