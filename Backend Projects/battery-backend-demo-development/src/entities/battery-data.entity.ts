import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

@Entity()
export class BatteryData extends BaseEntity{
    
    @ObjectIdColumn()
    id: ObjectID;
    
    @Column()
    bsn: string;

    @Column()
    macId: [];
    
    @Column()
    mode: string;

    @Column()
    timeStamp: number;

    @Column()
    voltage: number;

    @Column()
    current: number;

    @Column()
    temperature: number;

    @Column()
    specificGravity: number;

    @Column()
    electrolyteLevel: number;

    @Column()
    bulbCapacitance: number;

    @Column()
    levelCapacitance: number;

    @Column()
    ahin: number;

    @Column()
    ahout: number;

    @Column()
    idle1Penalty: number;

    @Column()
    idle2Penalty: number;

    @Column()
    cycleCount: number;

    @Column()
    iniRechargeIndexTS: number;

    @Column()
    refreshRechargeIndexTS: number;

    @Column()
    lastSucWiFiConnTS: number;

    @Column()
    lastSucBleConnTS: number;
    
    @CreateDateColumn()
    createdAt: Date;
    
}