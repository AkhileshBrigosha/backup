import { IsOptional } from "class-validator";
import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";


export class BatteryPenaltyDto{
    
    @IsOptional()
    id: number;
    
    @IsOptional()
    bsn: string;

    @IsOptional()
    macId: string;
    
    @IsOptional()
    mode: string;

    @IsOptional()
    timeStamp: number;

    @IsOptional()
    noOfPenalty: number;

    @IsOptional()
    payload: [];
    
}