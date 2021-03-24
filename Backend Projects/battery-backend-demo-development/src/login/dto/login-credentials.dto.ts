import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class LoginCredentialsDto {
    
    @IsOptional()
    @IsEmail({}, {message: "Enter valid email"})
    email: string;

    @IsOptional()
    @IsString({message: "Password is required"})
    password: string;
}