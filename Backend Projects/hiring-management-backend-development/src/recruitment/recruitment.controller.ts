import { Body, Controller, Delete, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../entities/user.entity';
import { CandidateSlotDto } from './dto/candidate-book-slot.dto';
import { RecruitmentService } from './recruitment.service';
import { UserRole } from '../users/enums/user.enum';
import { CandidateStatusDto } from './dto/candidate-status.dto';

@Controller('recruitment')
@UseGuards(AuthGuard())
export class RecruitmentController {

    constructor(
        private recruitmentService: RecruitmentService,
    ){}
    
    @Post('bookslot')
    bookCandidateSlot(
        @Body() candidateSlotDto: CandidateSlotDto,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.hr) || user.role.includes(UserRole.shortlister)){
            return {show:{type:'error',message:'You dont have permission for this operation'}}
        }
        return this.recruitmentService.createInterviewSlot(candidateSlotDto, user)
    }

    @Patch('status/:candidateId')
    updateCandidadeStatus(
        @Param('candidateId') candidateId: number,
        @Body() candidateStatusDto: CandidateStatusDto,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin) ||  user.role.includes(UserRole.shortlister)){
            return this.recruitmentService.updateCandidateStatus(candidateId, candidateStatusDto, user);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}};
    }

    @Patch('changejob/:candidateId')
    updateCandidadeJob(
        @Param('candidateId') candidateId: number,
        @Query('jobId') jobId: number,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin) || user.role.includes(UserRole.agency)){
            return this.recruitmentService.updateCandidateJob(candidateId, jobId, user);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}};
    }

    @Patch('skipround/:candidateId')
    skipRound(
        @Param('candidateId') candidateId: number,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.recruitmentService.skipRound(candidateId)
        }
        return {show:{type:'error',message:'You dont have permission for this operation'}}
    }


    @Delete('bookslot/:slotId')
    deleteCandidateInterviewSlot(
        @Param('slotId') slotId: number,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.hr) || user.role.includes(UserRole.shortlister)){
            return {show:{type:'error',message:'You dont have permission for this operation'}}
        }
        return this.recruitmentService.deleteCandidateInterviewSlot(slotId, user);
    } 


}
