import { IsString, IsOptional, IsEnum } from "class-validator";
import { PanelistStatus } from '../enum/panelist-enum';

export class PanelistFilterDto{

    @IsOptional()
    @IsString({message: "Enter valid search"})
    search: string;

    @IsOptional()
    @IsEnum(PanelistStatus,{message: "Enter valid status"})
    status: PanelistStatus;
   
}