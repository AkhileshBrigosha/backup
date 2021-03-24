import { IsOptional } from "class-validator";
import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";


export class BatteryDiagnosisDto{
    
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
    noOfDiagnosis: number;

    @IsOptional()
    payload: [];
    
}