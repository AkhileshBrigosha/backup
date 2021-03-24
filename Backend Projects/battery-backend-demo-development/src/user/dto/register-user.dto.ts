import { IsNotEmpty, IsString, IsEmail, IsNumberString, IsOptional, IsArray, IsEnum, IsNumber, MinLength, MaxLength, IsBoolean, ValidateIf, IsDate } from 'class-validator';


export class RegisterUserDto{

    @IsOptional()
    id: number;

    @IsNotEmpty({message: "Phone number should not be empty"})
    @MinLength(10,{message: "Phone number should be of 10 Digits"})
    @MaxLength(10,{message: "Phone number should be of 10 Digits"})
    mobileNumber: string;

    @IsNotEmpty({message: "First Name should not be empty"})
    @IsString({message:"Enter valid First Name"})
    FirstName: string;
    
    @IsNotEmpty({message: "Last Name should not be empty"})
    @IsString({message:"Enter valid Last Name"})
    LastName: string;

    @IsOptional()
    Pincode: number;

    @IsOptional()
    password: string;

    @IsOptional()
    salt: string;

    @IsNotEmpty({message: "BSN should not be empty"})
    @IsString({message:"Enter valid BSN"})
    batterySerialNumber: string;

    @IsNotEmpty({message: "Purchase Date should not be empty"})
    purchaseDate: Date;
    
    @IsOptional()
    warrantyExpiry: Date;
    
}