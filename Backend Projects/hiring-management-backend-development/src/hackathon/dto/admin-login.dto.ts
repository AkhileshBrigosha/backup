import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { TestType } from '../enum/hackathon.enum';

export class AdminLogin{

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

}
