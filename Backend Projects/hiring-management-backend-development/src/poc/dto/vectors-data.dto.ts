import { Type } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class VectorsDataDto{
    @IsNotEmpty({message: "Name should not be empty"})
    @IsString({message: "Name should not be string"})
    studentName: string;

    @IsNotEmpty({message: "Course should not be empty"})
    @IsString({message: "Course should be string"})
    course: string;

    @IsNotEmpty({message: "School name should not be empty"})
    @IsString({message: "School name should be string"})
    school: string;

    @IsNotEmpty({message: "Address name should not be empty"})
    @IsString({message: "Address name should be string"})
    address: string;

    @IsNotEmpty({message: "Phone number should not be empty"})
    @IsNumberString({message:"Enter valid phone number"})
    @MinLength(10,{message: "Phone number should be of 10 Digits"})
    @MaxLength(10,{message: "Phone number should be of 10 Digits"})
    phone: string;

    @IsOptional()
    @IsEmail({}, { message: "Invalid email" })
    email: string;

    @IsOptional()
    @IsString({ message: "Invalid date" })
    preferredExamDate: string;

}

