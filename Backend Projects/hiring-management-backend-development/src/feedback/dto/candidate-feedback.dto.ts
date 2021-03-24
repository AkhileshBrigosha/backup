import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min, IsObject } from 'class-validator';
import { CandidateStatus } from 'src/candidates/enum/candidate.enum';
import { JobRoundType } from '../../job-posting/enum/job.enum';
import { InterviewMode } from '../../recruitment/enum/recruitment.enum';

export class CandidateFeedbackDto{

    @IsNotEmpty({message: "JobId rating should not be empty"})
    @IsNumber({},{message: "JobId rating be in numbers"})
    jobId: number;

    @IsNotEmpty({message: "Round should not be empty"})
    @IsNumber({},{message:"Round must be number"})
    round: number;

    @IsNotEmpty({message: "Round Type should not be empty"})
    @IsEnum(JobRoundType,{message: "Enter valid round type"})
    roundType: JobRoundType;

    @IsNotEmpty({message: "Interview Mode should not be empty"})
    @IsEnum(InterviewMode,{message: "Enter valid Interview mode"})
    interviewMode: InterviewMode;

    @IsNotEmpty({message: "Interviewer should not be empty"})
    @IsString({message: "Enter valid Interviewer"})
    interviewer: string;

    @IsNotEmpty({message: "Interview Date should not be empty"})
    @Type(() => Date)
    interviewDate: Date;

    @IsNotEmpty({message: "Feedback details should not be empty"})
    @IsObject({message: "Feedback details should be in JSON format"})
    details: object;

    @IsNotEmpty({message: "Comment should not be empty"})
    @IsString({message: "Comment be in string"})
    overallComment: string;

    @IsNotEmpty({message: "Overall rating should not be empty"})
    @IsNumber({},{message: "Overall rating be in numbers"})
    @Min(0,{message: "Overall rating be should be between 0 - 10"})
    @Max(10,{message: "Overall rating be should be between 0 - 10"})
    overallRating: number;

    @IsNotEmpty({message: "Status should not be empty"})
    @IsEnum(CandidateStatus,{message: "Enter valid Candidate status"})
    status: CandidateStatus;

}