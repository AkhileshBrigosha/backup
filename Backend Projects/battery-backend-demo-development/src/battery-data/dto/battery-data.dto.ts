import { IsNotEmpty, IsString, IsEmail, IsNumberString, IsOptional, IsArray, IsEnum, IsNumber, MinLength, MaxLength, IsBoolean, ValidateIf } from 'class-validator';


export class BatteryDataDto{

    @IsOptional()
    id: number;

    @IsOptional()
    bsn: string;

    @IsOptional()
    macId: [];
    
    @IsOptional()
    mode: string;

    @IsOptional()
    timeStamp: number;

    @IsOptional()
    voltage: number;

    @IsOptional()
    current: number;

    @IsOptional()
    temperature: number;

    @IsOptional()
    specificGravity: number;
    
    @IsOptional()
    electrolyteLevel: number;

    @IsOptional()
    bulbCapacitance: number;

    @IsOptional()
    levelCapacitance: number;

    @IsOptional()
    ahin: number;

    @IsOptional()
    ahout: number;

    @IsOptional()
    idle1Penalty: number;

    @IsOptional()
    idle2Penalty: number;

    @IsOptional()
    cycleCount: number;
    
    @IsOptional()
    iniRechargeIndexTS: number;

    @IsOptional()
    refreshRechargeIndexTS: number;

    @IsOptional()
    lastSucWiFiConnTS: number;

    @IsOptional()
    lastSucBleConnTS: number;
}