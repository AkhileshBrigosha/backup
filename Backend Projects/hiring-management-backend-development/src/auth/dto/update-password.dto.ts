import { IsString, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class UpdatePasswordDto{
    
    @IsNotEmpty({message: "UserId should not be empty"})
    @IsNumber({},{message:"UserId must be number"})
    userId: number;

    @IsNotEmpty({message: "Password should not be empty"})
    @IsString({message:"Enter valid Password"})
    @MinLength(6,{message: "Password should be greater than 6 characters"})
    password: string

}