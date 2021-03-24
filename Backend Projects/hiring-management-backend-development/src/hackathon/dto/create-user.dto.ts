import { IsString, IsNotEmpty, IsEmail, IsNumberString,  IsArray } from 'class-validator';

export class CreateUser{

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsArray()
  programmingLangs: string[];

  @IsNotEmpty()
  @IsArray()
  skills: string[];



}
