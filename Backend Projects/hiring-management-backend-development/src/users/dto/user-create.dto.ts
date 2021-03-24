import { IsNotEmpty, IsString, IsEmail, IsNumberString, IsOptional, IsArray, IsEnum, IsNumber, MinLength, MaxLength, IsBoolean, ValidateIf } from 'class-validator';
import { UserRole, UserDesignation } from '../enums/user.enum';

export class UserCreateDto{
    @IsNotEmpty({message: "Name should not be empty"})
    @IsString({message: "Enter valid name"})
    name: string;
    
    @IsNotEmpty({message: "Email should not be empty"})
    @IsString({message: "Enter valid email"})
    @IsEmail({}, { message: "Enter valid email" })
    email: string;

    @IsNotEmpty({message: "Phone number should not be empty"})
    @IsNumberString({message:"Enter valid Phone number"})
    @MinLength(10,{message: "Phone number should be of 10 digits"})
    @MaxLength(10,{message: "Phone number should be of 10 digits"})
    phone: string;

    @IsOptional()
    @IsEnum(UserDesignation,{message: "Enter valid user designation"})
    designation: UserDesignation;

    @IsNotEmpty({message: "User role name should not be empty"})
    @IsArray({message:"Role must be an array"})
    @IsEnum(UserRole, {each: true, message: "Enter valid role"})
    role: UserRole[];

    @ValidateIf(o => o.role.includes(UserRole.agency))
    @IsNotEmpty()
    @IsBoolean({message:"Primary contact must be boolean"})
    primaryContact: boolean;

    @IsOptional()
    @IsNumber({},{message:"Id must be number"})
    id: number;

}