import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn, PrimaryColumn} from "typeorm";

@Entity()
export class UserBatteryEmbedded {
    
    @PrimaryColumn({type: 'varchar', length: 150})
    bsn: string;

    @Column({type: 'date', length: 150})
    purchaseDate: Date;
    
    @Column({type: 'date', length: 150})
    warrantyExpiry: Date;
    
    @Column({type: 'varchar', length: 150})
    vehicleRegistrationNumber: string;

    @Column({type: 'varchar', length: 10})
    registrationFor: string;

    @Column({type: 'varchar', length: 20})
    batteryType: string;
    

    constructor(bsn: string, purchaseDate: Date, warrantyExpiry: Date,vehicleRegistrationNumber:string,registrationFor:string,batteryType:string) {
        this.bsn = bsn;
        this.purchaseDate = purchaseDate
        this.warrantyExpiry = warrantyExpiry
        this.vehicleRegistrationNumber = vehicleRegistrationNumber
        this.registrationFor = registrationFor
        this.batteryType = batteryType
       
    }
}