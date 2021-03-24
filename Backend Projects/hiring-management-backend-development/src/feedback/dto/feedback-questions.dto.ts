import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { FeedbackFormType } from '../enum/feedback.enum';

export class FeedbackQuestionDto {
    @IsNotEmpty({message: "Feedback question type can't be empty"})
    @IsEnum(FeedbackFormType, {message: "Feedback question type must be a valid enum"})
    feedbackType: FeedbackFormType;

    @IsNotEmpty({message: "Feedback questions can't be empty"})
    @IsObject({message: "Feedback questions must be a JSON object"})
    questions: object;
}