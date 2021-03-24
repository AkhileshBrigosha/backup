import { IsString, IsEmail, IsNotEmpty } from "class-validator";

export class AuthCredentialsDto{
    
    @IsNotEmpty({message: "Email should not be empty"})
    @IsString({message: "Enter valid Email"})
    @IsEmail({}, { message: "Invalid email" })
    email: string;

    @IsNotEmpty({message: "Password should not be Empty"})
    @IsString({message: "Enter valid Password"})
    password: string;
}