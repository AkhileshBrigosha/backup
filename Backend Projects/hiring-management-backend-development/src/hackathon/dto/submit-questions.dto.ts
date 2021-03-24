import { IsString, IsNotEmpty, IsEnum,  IsArray, IsOptional, IsNumber, ValidateNested, ValidateIf } from 'class-validator';
import { QType } from '../enum/hackathon.enum';
import { Transform, Type } from 'class-transformer';

export class SubmitQuestionsDto{

  @IsNotEmpty()
  @IsNumber()
  candidateId: number;

  @IsNotEmpty()
  @IsNumber()
  testId: number;

  @IsNotEmpty()
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => AnswerType)
  answers: AnswerType[]

}

class AnswerType {
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @IsString()
  answer: string;

}
