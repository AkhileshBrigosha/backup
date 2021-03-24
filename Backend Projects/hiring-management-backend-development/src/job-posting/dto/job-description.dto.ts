import { IsString, IsOptional, IsNotEmpty, IsNumber, ValidateNested, IsArray, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { JobStatus, JobRoundType, JobLocation, JobType, JobPriority } from '../enum/job.enum';

export class InterviewerDto {

    @IsNotEmpty({message: "Round should not be empty"})
    @IsNumber({},{message:"Round must be number"})
    round: number;

    @IsNotEmpty({message: "Round Type should not be empty"})
    @IsEnum(JobRoundType,{message: "Enter valid Round Type"})
    roundType: JobRoundType;

    @IsNotEmpty({message: "Panelist should not be empty"})
    @IsNumber({},{message:"Panelist must be number"})
    panelistId: number;

    @IsOptional()
    @IsNumber({},{message:"Id must be number"})
    id: number;

}
export class JobDescriptionDto{

    @IsNotEmpty({message: "Title should not be empty"})
    @IsString({message: "Enter valid title"})
    title: string;
    
    @IsNotEmpty({message: "Location should not be empty"})
    @IsArray({message:"Location must be an array"})
    @IsEnum(JobLocation, {each: true,message:"Enter valid Job location"},)
    location: JobLocation[];

    @IsNotEmpty({message: "Job type should not be empty"})
    @IsEnum(JobType,{message:"Job type should be boolean"})
    jobType: JobType;

    @IsNotEmpty({message: "Description Should not be empty"})
    @IsString({message: "Enter valid description"})
    description: string;

    @IsOptional()
    @IsArray({message: "Keywords must be an array"})
    @IsString({each: true, message: "Enter valid description"})
    keywords: string[];

    @IsNotEmpty({message: "Vacancy should not be empty"})
    @IsNumber({},{message:"Vacancy must be number"})
    vacancies: number;

    @IsNotEmpty({message: "Priority should not be empty"})
    @IsEnum(JobPriority,{message:"Priority should be a valid enum"})
    priority: JobPriority;

    @IsNotEmpty({message: "Minimum experience should not be empty"})
    @IsNumber({},{message:"Minimum experience must be number"})
    minExperience: number;

    @IsNotEmpty({message: "Maximum experience should not be empty"})
    @IsNumber({},{message:"Maximum Experience must be number"})
    maxExperience: number;

    @IsOptional()
    @IsNumber({},{message:"Notice Period must be number"})
    noticePeriod: number;

    @IsNotEmpty({message:"Interviewers are required"})
    @IsArray({message:"Job interviewers must be an array"})
    @ValidateNested({each:true})
    @Type(() => InterviewerDto)
    jobInterviewers: InterviewerDto[]; 

    @IsNotEmpty({message:"Shortlister is required"})
    @IsNumber({}, {message:"Shortlister must be a number"})
    shortlister: number;

    @IsOptional()
    @IsEnum(JobStatus,{message: "Enter valid job status"})
    status: JobStatus;

    @IsNotEmpty({message: "Single point of contact should not be empty"})
    @IsNumber({},{message:"Sibgle poit of contact must be number"})
    spoc: number;

    @IsOptional()
    @IsArray({message:"Agencies must be an array"})
    agencies: number[];

    @IsOptional()
    @IsArray({message:"Deleted must be an array"})
    @IsNumber({},{each:true,message:"Deleted must be number"})
    deleted: number[]

    @IsOptional()
    @IsArray({message:"Edited must be an array"})
    @IsNumber({},{each:true,message:"Edited must be number"})
    edited: number[]
   
    @IsNotEmpty({message: "Round Count should not be empty"})
    @IsNumber({},{message:"Round Count must be number"})
    roundCount: number;
}