import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { Candidates } from '../entities/candidates.entity';
import { CandidateFeedbackDto } from 'src/feedback/dto/candidate-feedback.dto';
import { InterviewMode, InterviewSlotStatus } from 'src/recruitment/enum/recruitment.enum';
import { Feedback } from 'src/entities/feedback.entity';
import { getConnection } from 'typeorm';
import { JobRoundType } from 'src/job-posting/enum/job.enum';
import { InterviewSlots } from '../entities/interview-slots.entity';
import { FeedbackQuestionDto } from './dto/feedback-questions.dto';
import { FeedbackQuestions } from '../entities/feedback.questions.entity';
import { JobInterviewers } from '../entities/job-interviewers.entity';
import { JobType } from '../job-posting/enum/job.enum';
import { FeedbackFormType, MaritalStatus, AutomotiveBackground } from './enum/feedback.enum';
import { CandidateStatus } from 'src/candidates/enum/candidate.enum';

@Injectable()
export class FeedbackService {

    async getCandidateForFeedback(candidateId: number): Promise<object>{
        const candidateConnection = getConnection('default');
        const candidate = await candidateConnection.getRepository(Candidates).createQueryBuilder('candidate')
                                                    .leftJoinAndSelect('candidate.interviewSlots', 'interviewSlots')
                                                    .leftJoinAndSelect('candidate.jobs','jobs')
                                                    .leftJoinAndSelect('candidate.feedback', 'feedback')
                                                    .where('candidate.id = :candidateId', {candidateId})
                                                    .andWhere('interviewSlots.interviewStatus = :status', {status: InterviewSlotStatus.scheduled})
                                                    .getOne();  
        if(!candidate){
            return{show:{type:'error',message:'This interview might have been cancelled kindly contact admin'}}
        }                                      
        const jobInterviewer = await candidateConnection.manager.findOne(JobInterviewers, 
            {
                where: [{jobs: candidate.jobs.id, round: candidate.currentRound}]
            })
        
        const query = candidateConnection.getRepository(FeedbackQuestions).createQueryBuilder('questions');
        
        if(jobInterviewer.roundType === JobRoundType.technical){
            if(candidate.jobs.jobType === JobType.rnd){
                query.where('questions.feedbackType = :type', {type: FeedbackFormType.technicalRnD});
            }else{
                query.where('questions.feedbackType = :type', {type: FeedbackFormType.technicalAutomotive});  
            }
        }else{
            query.where('questions.feedbackType = :type', {type: jobInterviewer.roundType});  
        }

        const feedbackQuestions = await query.getOne();
        const status = jobInterviewer.roundType === JobRoundType.technical ? [CandidateStatus.selected, CandidateStatus.notSelected] : [CandidateStatus.selected, CandidateStatus.notSelected, CandidateStatus.hold];
        return {candidate, jobInterviewer, feedbackQuestions, status, maritalStatus: Object.values(MaritalStatus), automotiveBackground: Object.values(AutomotiveBackground), interviewMode: Object.values(InterviewMode), roundType: Object.values(InterviewMode)}

    }

    async getFeedbackQuestions(questionId: number){
        const candidateConnection = getConnection('default');

        if(questionId){
            return await candidateConnection.manager.findOne(FeedbackQuestions, {id: questionId});
        }
        return await candidateConnection.manager.find(FeedbackQuestions);
    }

    async updateFeedback(candidateFeedbackDto: CandidateFeedbackDto, candidateId: number): Promise<object>{
        const {round,roundType,interviewer,interviewDate, details, overallComment, overallRating, status, interviewMode, jobId} = candidateFeedbackDto;
        
        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        await queryRunner.connect();

        const exitingfeedback = await queryRunner.manager.findOne(Feedback, {
            relations: ['candidate'],
            where: [{candidate: candidateId, round: round, jobId: jobId}]
        });

        if(exitingfeedback){
            return {show:{type:'error',message:'Feedback form already submitted'}}
        }

        const candidate = await queryRunner.manager.findOne(Candidates, {
            relations: ['jobs'],
            where: {id: candidateId}
        });
        
        const feedback = new Feedback();
        feedback.round = round;
        feedback.roundType = roundType;
        feedback.interviewMode = interviewMode;
        feedback.interviewer = interviewer;
        feedback.interviewDate = interviewDate;
        feedback.details = details;
        feedback.overallComment = overallComment;
        feedback.overallRating = overallRating;
        feedback.status = status;
        feedback.candidate = candidate;
        feedback.jobId = jobId;
        if(status == CandidateStatus.selected && roundType == JobRoundType.hr){
            candidate.candidateStatus = CandidateStatus.selected;
        }else if(status == CandidateStatus.selected){
            candidate.candidateStatus = CandidateStatus.inprogress;
        }else{
            candidate.candidateStatus = status;
        }
        const interviewSlot = await queryRunner.manager.findOne(InterviewSlots, {
            where: {candidate: candidateId, date: interviewDate, interviewStatus: InterviewSlotStatus.scheduled}
        });


        interviewSlot.interviewStatus = InterviewSlotStatus.completed;

        await queryRunner.startTransaction();
        try{
            await queryRunner.manager.save(feedback);
            await queryRunner.manager.save(candidate);
            await queryRunner.manager.save(interviewSlot);
            await queryRunner.commitTransaction()
        }catch(error){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        }finally{
            await queryRunner.release();
        }

        return {show: {type: 'success', message: 'Feedback submitted successfully'}}
    }

    async updateFeedbackQuestions(feedbackQuestionDto: FeedbackQuestionDto, questionId: number): Promise<object>{
        const {feedbackType, questions} = feedbackQuestionDto;

        const candidateConnection = getConnection('default');
        const queryRunner = candidateConnection.createQueryRunner();
        await queryRunner.connect();

        let question = await queryRunner.manager.findOne(FeedbackQuestions, {id:questionId});

        if(!question){
            question = new FeedbackQuestions();
        }

        question.feedbackType = feedbackType;
        question.questions = questions;

        await queryRunner.startTransaction()
        try{
            await queryRunner.manager.save(question);
            await queryRunner.commitTransaction();
        }catch(e){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }

        return {show:{type:'success', message: 'Feedback questions updated'}}

    }
}
