import { IsString, IsNotEmpty, IsEmail, IsNumberString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { PanelistStatus } from '../enum/panelist-enum';
import { UserDesignation } from '../../users/enums/user.enum';

export class CreatePanelistDto{

    @IsNotEmpty({message: "Name should not be empty"})
    @IsString({message:"Enter valid name"})
    name: string;

    @IsNotEmpty({message: "Email should not be empty"})
    @IsEmail({}, { message: "Invalid email" })
    email: string;

    @IsNotEmpty({message: "Phone number should not be empty"})
    @IsNumberString({message:"Enter valid phone number"})
    @MinLength(10,{message: "Phone number should be of 10 Digits"})
    @MaxLength(10,{message: "Phone number should be of 10 Digits"})
    phone: string;

    @IsOptional()
    @IsEnum(UserDesignation,{message: "Enter valid User designation"})
    designation: UserDesignation;

    @IsOptional()
    @IsEnum(PanelistStatus,{message: "Enter valid panelist status"})
    status: PanelistStatus;
   
}