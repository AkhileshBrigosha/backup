import { IsString, IsOptional, IsNotEmpty } from "class-validator";

export class ScheduleFilterDto{

    @IsOptional()
    @IsNotEmpty({message: "Date should not be empty"})
    @IsString({message: "Enter valid Date"})
    date: string;
   
}