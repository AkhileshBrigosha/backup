import { IsString, IsOptional, IsEnum } from "class-validator";
import { AgencyStatus } from '../enums/agency.enum';

export class AgencyFilterDto{

    @IsOptional()
    @IsString({message: "Enter valid search"})
    search: string;
    
    @IsOptional()
    @IsEnum(AgencyStatus,{message: "Enter valid Agency status"})
    status: AgencyStatus;

}