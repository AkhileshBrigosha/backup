import { Controller, UseGuards, Body, Post, Param, Get, Patch, UseInterceptors, Query, UploadedFiles } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CandidatesService } from './candidates.service';
import { CandidateDescriptionDto } from './dto/candidate-create.dto';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../entities/user.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { candidateFileFilter } from '../common/image-upload/image-upload.utils';
import { CandidateFilterDto, CandidateFilterDtoHistory } from './dto/candidate-filter.dto';
import { UserRole } from 'src/users/enums/user.enum';
import {memoryStorage} from 'multer';
import { CandidateFlagDto } from './dto/candidate-flag.dto';

@Controller('candidates')
@UseGuards(AuthGuard())
export class CandidatesController {
    constructor(
        private candidatesService: CandidatesService,
    ){}


    @Get("all")
    getAllCandidatesForAdmin(
        @Query() candidateFilterDto: CandidateFilterDto,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.agency)){
            return {show: {type: "error", message: "You don't have permission for this operation"}}
        }
        return this.candidatesService.getAllCandidatesForAdmin(candidateFilterDto, user);
    }

    @Get("history")
    getAllCandidatesForAdminHistory(
        @Query() candidateFilterDto: CandidateFilterDtoHistory,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.agency)){
            return {show: {type: "error", message: "You don't have permission for this operation"}}
        }
        return this.candidatesService.getAllCandidatesForAdminHistory(candidateFilterDto, user);
    }

    @Get("agency")
    getAllCandidatesForAgency(
        @Query() candidateFilterDto: CandidateFilterDto,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.agency)){
            return this.candidatesService.getAllCandidatesForAgency(candidateFilterDto, user); 
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Get("duplicate/:candidateId")
    getCandidates(
        @Param('candidateId') candidateId: number,
        @GetUser() user: User
    ){
        return this.candidatesService.getDuplicateCandidates(candidateId);
    }

    @Get(":jobId/:candidateId")
    getCandidateById(
        @Param('jobId') jobId: number,
        @Param('candidateId') candidateId: number,
        @Query('slot') slot: boolean,
        @Query('date') date: string,
        @GetUser() user: User
    ){
        if(slot){
            return this.candidatesService.getSlotForCandidate(jobId, candidateId, user, date);
        }
        return this.candidatesService.getCandidateById(jobId, candidateId, user);
    }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'candidatePhoto', maxCount: 1 },
            { name: 'resume', maxCount: 1 },
        ], {
          storage: memoryStorage(),
          fileFilter: candidateFileFilter,
        }),
    )
    async createCandidate(
        @Body() candidateDescriptionDto: CandidateDescriptionDto,
        @GetUser() user: User,
        @UploadedFiles() files,
    ){
        if(!files.resume && !files.candidatePhoto){
            return {show: {type: 'error', message: 'Resume & candidate photo is required'}}
    
        }
       
        return this.candidatesService.createCandidate(user, candidateDescriptionDto, files);
    
    }

    @Patch(':candidateId')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'candidatePhoto', maxCount: 1 },
            { name: 'resume', maxCount: 1 },
        ], {
          storage: memoryStorage(),
          fileFilter: candidateFileFilter,
        }),
    )
    async updateCandidate(
        @Param('candidateId') candidateId: number,
        @Body() candidateDescriptionDto: CandidateDescriptionDto,
        @GetUser() user: User,
        @UploadedFiles() files,
    ){
        return this.candidatesService.updateCandidate(candidateId, user, candidateDescriptionDto, files);
        
    }

    @Patch('candidatephoto/:candidateId')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'candidatePhoto', maxCount: 1 },
        ], {
          storage: memoryStorage(),
          fileFilter: candidateFileFilter,
        }),
    )
    async updateCandidatePhoto(
        @Param('candidateId') candidateId: number,
        @GetUser() user: User,
        @UploadedFiles() files,
    ){
        if(!files.candidatePhoto){
            return {show: {type: 'error', message: 'candidate photo is required'}}
    
        }
        return this.candidatesService.updateCandidatePhoto(candidateId, files);
        
    }

    @Patch('flag/:candidateId')
    updateCandidateFlag(
        @Param('candidateId') candidateId: number,
        @Body() candidateFlagDto: CandidateFlagDto
    ){
        return this.candidatesService.updateCandidateFlag(candidateId, candidateFlagDto);
    }

    @Patch('comment/:candidateId')
    updateCandidateComment(
        @Param('candidateId') candidateId: number,
        @Body('comment') comment: string
    ){
        return this.candidatesService.updateCandidateComment(candidateId, comment);
    }

    // @Patch('photo/:candidateId')
    // @UseInterceptors(
    //     FileFieldsInterceptor([
    //         { name: 'candidatePhoto', maxCount: 1 }
    //     ], {
    //       storage: memoryStorage(),
    //       fileFilter: candidateFileFilter,
    //     }),
    // )
    // updateCandidatephoto(
    //     @Param('candidateId') candidateId: number,
    //     @Body('candidatePhoto') photo: any,
    //     @UploadedFiles() files,
    // ){  
    //     return this.candidatesService.updateCandidatePhoto(candidateId, files, photo);
    // }
}
