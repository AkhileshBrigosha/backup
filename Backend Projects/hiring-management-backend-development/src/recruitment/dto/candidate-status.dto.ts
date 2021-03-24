import { IsNotEmpty, IsEnum } from "class-validator";
import { CandidateStatus } from "src/candidates/enum/candidate.enum";
export class CandidateStatusDto{

    @IsNotEmpty({message: "Candidate status should not be empty"})
    @IsEnum(CandidateStatus,{message: "Enter valid candidate status"})
    status: CandidateStatus;
   
}
