import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, IsNumber } from 'class-validator';
import { TestType } from '../enum/hackathon.enum';

export class CreateTest{

  @IsOptional()
  id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(TestType, {message: "Enter valid type"})
  type: TestType;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsNumber()
  duration: string;

}
