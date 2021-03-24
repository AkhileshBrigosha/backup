import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

@Entity()
export class BatteryDetails extends BaseEntity{
    
    @ObjectIdColumn()
    id: ObjectID;
    
    @Column()
    bsn: string;

    @Column()
    macId: [];
    
    @Column()
    mode: string;

    @Column()
    lat: number;

    @Column()
    lng: number;

    @Column()
    batteryInfo: string;

    @Column()
    wifiSSID: string;

    @Column()
    WifiPassword: string;

    @Column()
    BLEId: string;

    @Column()
    firmwareId: string;

    @Column()
    firmwareVer: string;

    @Column()
    hardwareVer: string;

    @Column()
    validTill: Date;

    @Column()
    isActive: boolean;
    
    @CreateDateColumn()
    createdAt: Date;
    
}