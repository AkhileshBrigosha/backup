import { IsNotEmpty, IsString, IsEmail, IsNumberString, IsOptional, IsArray, IsEnum, IsNumber, MinLength, MaxLength, IsBoolean, ValidateIf } from 'class-validator';


export class BatteryDetailsDto{

    @IsOptional()
    id: number;

    @IsOptional()
    bsn: string;

    @IsOptional()
    macId: [];
    
    @IsOptional()
    mode: string;

    @IsOptional()
    lat: number;

    @IsOptional()
    lng: number;

    @IsOptional()
    batteryInfo: string;

    @IsOptional()
    wifiSSID: string;

    @IsOptional()
    wifiPassword: string;

    @IsOptional()
    BLEId: string;

    @IsOptional()
    firmwareId: string;

    @IsOptional()
    firmwareVer: string;

    @IsOptional()
    hardwareVer: string;

    @IsOptional()
    validTill: Date;
    
    @IsOptional()
    isActive: boolean;
}