import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { CandidateFilter } from '../enum/candidate.enum';

export class CandidateFilterDto{

    @Transform(o => JSON.parse(o), {toClassOnly: true})
    @IsOptional()
    @IsNumber({},{message:"JobId must be number"})
    jobId: number;

    @Transform(o => JSON.parse(o), {toClassOnly: true})
    @IsOptional()
    @IsNumber({},{message:"Agency Id must be number"})
    agencyId: number;

    @IsOptional()
    @IsString({message: "Enter valid search"})
    search: string;

    @Transform(o => JSON.parse(o), {toClassOnly: true})
    @IsOptional()
    @IsNumber({},{message: "Enter valid round"})
    round: number;
    
    @IsOptional()
    @IsString({message: "Enter valid date range"})
    dateRange: string;

    @IsOptional()
    @IsEnum(CandidateFilter,{message: "Enter valid status"})
    status: CandidateFilter;

}

export class CandidateFilterDtoHistory{

    @Transform(o => JSON.parse(o), {toClassOnly: true})
    @IsOptional()
    jobId: number[];

    @Transform(o => JSON.parse(o), {toClassOnly: true})
    @IsOptional()
    agencyId: number[];

    @IsOptional()
    @IsString({message: "Enter valid search"})
    search: string;

    @Transform(o => JSON.parse(o), {toClassOnly: true})
    @IsOptional()
    @IsNumber({},{message: "Enter valid round"})
    round: number;
    
    @IsOptional()
    @IsString({message: "Enter valid date range"})
    dateRange: string;

    @IsOptional()
    @IsEnum(CandidateFilter,{message: "Enter valid status"})
    status: CandidateFilter;
}
