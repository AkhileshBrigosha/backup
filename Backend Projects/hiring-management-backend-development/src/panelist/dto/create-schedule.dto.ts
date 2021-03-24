import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Weekdays } from '../enum/schedule-enum';

export class createTimeSlotDto {
    
    @IsNotEmpty({message: "WeekDay should not be empty"})
    @IsEnum(Weekdays,{message:"Enter valid Weekdays"})
    weekday: Weekdays;
    
    @IsNotEmpty({message: "Start Time should not be empty"})
    @IsString({message: "Enter valid start time"})
    startTime: string;

    @IsNotEmpty({message: "End Time should not be empty"})
    @IsString({message: "Enter valid end time"})
    endTime: string;

    @IsOptional()
    @IsNumber({},{message:"Id must be number"})
    id: number;
    
}

export class CreateScheduleDto{ 

    @IsNotEmpty({message: "Panelist should not be empty"})
    @IsNumber({},{message:"Panelist Id must be number"})
    panelistId: number;

    @IsNotEmpty({message: "Schedules should not be empty"})
    @IsArray({message:"Schedules must be an array"})
    @ValidateNested({each:true})
    @Type(() => createTimeSlotDto)
    schedules: createTimeSlotDto[]; 
    
    @IsOptional()
    @IsArray({message:"Deleted must be an array"})
    @IsNumber({},{each:true,message:"Deleted must be number"})
    deleted: number[]
   
}