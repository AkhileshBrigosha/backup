import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional } from "class-validator";

export class SensorDataDto{

    @IsNotEmpty()
    @IsArray()
    @Type(() => SensorData)
    sensorDatas: SensorData[];
}

export class SensorData{
    @IsOptional()
    name: string;

    @IsOptional()
    accelerometer: object;

    @IsOptional()
    gyroscope: object;

    @IsOptional()
    magnetometer: object;

    @IsOptional()
    barometer: object;
}
