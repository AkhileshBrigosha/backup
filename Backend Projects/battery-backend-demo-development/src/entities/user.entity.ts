import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";
import { UserBatteryEmbedded } from "./userBatteryEmbedded.entity";

@Entity()
export class User extends BaseEntity{
    
    @ObjectIdColumn()
    id: ObjectID;
    
    @Column({type: 'varchar', length: 10, unique: true})
    phone: string;

    @Column({type: 'varchar', length: 150})
    fName: string; 

    @Column({type: 'varchar', length: 150})
    lName: string;

    @Column({type: 'varchar'})
    password: string;

    @Column()
    salt: string;

    @Column({type: 'varchar'})
    sessionId: string;

    @Column()
    passwordToken: string;
    
    @Column({type: 'int', length: 50})
    pinCode: number;

    @Column(type => UserBatteryEmbedded)
    userBatteryEmbedded: UserBatteryEmbedded[];
    
    @CreateDateColumn()
    createdAt: Date;
    
}