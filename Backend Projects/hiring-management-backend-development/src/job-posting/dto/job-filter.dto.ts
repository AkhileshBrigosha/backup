import { IsString, IsOptional, IsEnum } from "class-validator";
import { JobStatus } from '../enum/job.enum';

export class JobFilterDto{

    @IsOptional()
    @IsString({message: "Enter valid search"})
    search: string;
    

    @IsOptional()
    @IsEnum(JobStatus,{message: "Enter valid job status"})
    status: JobStatus;
   
}