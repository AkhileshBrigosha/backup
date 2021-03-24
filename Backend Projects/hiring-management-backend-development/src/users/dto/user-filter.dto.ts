import { IsString, IsOptional, IsEnum } from "class-validator";
import { UserRole, UserStatus } from '../enums/user.enum';

export class UserFilterDto{

    @IsOptional()
    @IsString({message: "Enter valid search"})
    search: string;
    
    @IsOptional()
    @IsEnum(UserStatus,{message: "Enter valid User status"})
    status: UserStatus;

    @IsOptional()
    @IsEnum(UserRole,{message: "Enter valid user role"})
    role: UserRole;
}