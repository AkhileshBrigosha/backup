import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { CandidateFeedbackDto } from './dto/candidate-feedback.dto';
import { FeedbackService } from './feedback.service';
import { FeedbackQuestionDto } from './dto/feedback-questions.dto';

@Controller('feedback')
export class FeedbackController {
    constructor(
        private feedbackService: FeedbackService
    ){}
    
    @Get('allquestions')
    getAllFeedbackQuestions
    (
        @Param('questionId') questionId: number
    ){
        return this.feedbackService.getFeedbackQuestions(null);
    }

    @Get('questions/:questionId')
    getFeedbackQuestions
    (
        @Param('questionId') questionId: number
    ){
        return this.feedbackService.getFeedbackQuestions(questionId);
    }
    
    @Get(':candidateId')
    getCandidateDetails(
        @Param('candidateId') candidateId: number,
    ){
        return this.feedbackService.getCandidateForFeedback(candidateId);
    }

   

    @Post('questions')
    createFeedbackQuestions
    (
        @Body() feedbackQuestionDto: FeedbackQuestionDto,
    ){
        return this.feedbackService.updateFeedbackQuestions(feedbackQuestionDto, null)
    }

    @Post(':candidateId')
    updateFeedback
    (
        @Body() candidateFeedbackDto: CandidateFeedbackDto,
        @Param('candidateId') candidateId: number,
    ){
        return this.feedbackService.updateFeedback(candidateFeedbackDto, candidateId)
    }

    @Patch('questions/:questionId')
    updateFeedbackQuestions
    (
        @Body() feedbackQuestionDto: FeedbackQuestionDto,
        @Param('questionId') questionId: number,
    ){
        return this.feedbackService.updateFeedbackQuestions(feedbackQuestionDto, questionId)
    }
}
