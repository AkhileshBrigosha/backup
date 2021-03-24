import { IsNotEmpty, IsString, IsEmail, IsNumberString, IsOptional, IsArray, IsEnum, IsNumber, MinLength, MaxLength, IsBoolean, ValidateIf } from 'class-validator';


export class BatteryStatusDto{

    @IsOptional()
    id: number;

    @IsOptional()
    bsn: string;

    @IsOptional()
    macId: string;
    
    @IsOptional()
    batteryState: string;

    @IsOptional()
    timeStamp: number;

    @IsOptional()
    cycleCount: number;

    @IsOptional()
    ahin: number;

    @IsOptional()
    ahout: number;

    @IsOptional()
    SOC: number;

    @IsOptional()
    TTE: number;

    @IsOptional()
    TotalPenalty: number;
    
}