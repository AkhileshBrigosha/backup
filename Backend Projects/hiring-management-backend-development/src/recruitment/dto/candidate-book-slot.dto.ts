import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { InterviewMode } from '../enum/recruitment.enum';

export class CandidateSlotDto{

    @IsNotEmpty({message: "Date should not be empty"})
    @Type(() => Date)
    date: Date;

    @IsNotEmpty({message: "Candidate Id should not be empty"})
    @IsNumber({},{message:"Candidate Id must be number"})
    candidateId: number;

    @IsNotEmpty({message: "Schedule Id should not be empty"})
    @IsNumber({},{message:"Schedule Id must be number"})
    scheduleId: number;

    @IsNotEmpty({message: "Current round should not be empty"})
    @IsNumber({},{message:"Current round must be number"})
    currentRound: number;

    @IsNotEmpty({message: "Interview mode should not be empty"})
    @IsEnum(InterviewMode,{message: "Enter valid Interview Mode"})
    interviewMode: InterviewMode;
      
}