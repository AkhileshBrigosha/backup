import { IsBoolean, IsOptional } from "class-validator";

export class CandidateFlagDto {
    @IsOptional()
    @IsBoolean({message: 'Duplicate must be a boolean'})
    duplicate: boolean;

    @IsOptional()
    @IsBoolean({message: 'Blacklist must be a boolean'})
    blacklist: boolean;
    
}


