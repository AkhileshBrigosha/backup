import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto{
    
    @IsNotEmpty({message: "Email should not be empty"})
    @IsString({message: "Enter valid Email"})
    @IsEmail({}, { message: "Invalid email" })
    email: string;

}