import { IsString, IsNotEmpty, IsEnum,  IsArray, IsOptional, IsNumber, ValidateNested, ValidateIf } from 'class-validator';
import { QType } from '../enum/hackathon.enum';
import { Transform, Type } from 'class-transformer';

export class CreateQuestions{

  @IsNotEmpty()
  @IsNumber()
  testId: number;

  @IsNotEmpty()
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => QuestionType)
  questions: QuestionType[]
}

export class QuestionType {

  @IsOptional()
  id: number;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsEnum(QType, {message: "Enter valid type"})
  type: QType;

  @IsOptional()
  positive: number;

  @IsOptional()
  negative: number;

  @IsArray()
  @ValidateIf(item => item.type === QType.mcq)
  options: string[];

  @IsOptional()
  @IsString()
  answer: string;
}
