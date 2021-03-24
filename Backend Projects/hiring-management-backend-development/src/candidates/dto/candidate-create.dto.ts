import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsEmail, IsNumberString, IsEnum, IsBoolean, MinLength, MaxLength, Min, Max } from 'class-validator';
import { JobLocation } from '../../job-posting/enum/job.enum';
import { CandidateStatus } from '../enum/candidate.enum';

export class CandidateDescriptionDto{

    @Transform(options => (JSON.parse(options)), {toClassOnly: true})
    @IsNotEmpty({message: "JobId should not be empty"})
    @IsNumber({},{message:"JobId must be number"})
    jobId: number;

    @IsNotEmpty({message: "Name should not be empty"})
    @IsString({message:"Enter valid name"})
    name: string;

    @IsNotEmpty({message: "Email should not be empty"})
    @IsEmail({}, { message: "Invalid email" })
    email: string;

    @IsNotEmpty({message: "Phone should not be empty"})
    @IsNumberString({message:"Enter valid Phone number"})
    @MinLength(10,{message: "Phone number must be 10 digits"})
    @MaxLength(10,{message: "Phone number must be 10 digits"})
    phone: string;

    @IsOptional()
    @IsString({message:"Enter valid skypeId"})
    skypeId: string;

    @Transform(options => (JSON.parse(options)), {toClassOnly: true})
    @IsNotEmpty({message: "Experience in Years should not be empty"})
    @IsNumber({},{message:"Experience years must be number"})
    @Min(0,{message: "Minimum experience year should be 0"})
    experienceYears: number;

    @Transform(options => (JSON.parse(options)), {toClassOnly: true})
    @IsOptional()
    @IsNumber({},{message:"Experience Months must be number"})
    @Min(0,{message: "Minimum experience month should be 0"})
    @Max(11,{message: "Maximum experience months should be less than 12"})  
    experienceMonths: number;
    
    @IsOptional()
    @IsString({message: "Enter valid company"})
    currentCompany: string;

    @IsOptional()
    @IsNumberString({message:"CTC must be number"})
    @MinLength(0,{message: "Minimum CTC should be 0"})
    @MaxLength(8,{message: "Maximum CTC should be less or equal to 8 Digit"})
    currentCtc: string;

    @IsOptional()
    @IsNumberString({message:"CTC must be number"})
    @MinLength(0,{message: "Maximum CTC should be 0"})
    @MaxLength(8,{message: "Maximum CTC should be less or equal to 8 Digit"})
    expectedCtc: string;

    @IsNotEmpty({message: "Current location should not be empty"})
    @IsString({message: "Enter valid location"})
    currentLocation: string;

    @IsOptional()
    @IsEnum(JobLocation,{message: "Enter valid Job location"})
    preferredLocation: JobLocation;

    @Transform(options => (JSON.parse(options)), {toClassOnly: true})
    @IsNotEmpty({message: "Notice Period should not be empty"})
    @IsNumber({},{message:"Notice Period must be number"})
    @Min(0,{message: "Minimum Notice Period should be 0"})
    noticePeriod: number;

    @IsOptional()
    resume: any;

    @IsOptional()
    candidatePhoto: any;

    @IsOptional()
    @IsString({message: "Enter valid reference"})
    reference: string;

    @IsOptional()
    @IsBoolean({message:"Duplicate must be boolean"})
    duplicate: boolean;
    
    @IsOptional()
    @IsBoolean({message:"Blacklist must be boolean"})
    blacklist: boolean;

    @IsOptional()
    @IsEnum(CandidateStatus,{message: "Candidate status must be valid type"})
    candidateStatus: CandidateStatus;
   
}