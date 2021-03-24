import { IsOptional } from "class-validator";
import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";


export class BatterySensorDto{
    
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
    volatage: number;

    @IsOptional()
    current: number;

    @IsOptional()
    temperature: number;

    @IsOptional()
    specificGravity: number;

    @IsOptional()
    electrolyteLevel: number;

    @IsOptional()
    levelCapacitance: number;
    
}