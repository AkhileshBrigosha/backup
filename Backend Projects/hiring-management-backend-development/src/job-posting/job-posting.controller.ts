import { Controller, UseGuards, Post, Body, Query, Get, Patch, Param } from '@nestjs/common';
import { JobPostingService } from './job-posting.service';
import { AuthGuard } from '@nestjs/passport';
import { JobDescriptionDto } from './dto/job-description.dto';
import { JobFilterDto } from './dto/job-filter.dto'
import { GetUser } from '../users/get-user.decorator';
import { User } from '../entities/user.entity';
import { UserRole } from '../users/enums/user.enum';
import { JobStatus } from './enum/job.enum';

@Controller('job')
@UseGuards(AuthGuard())
export class JobPostingController {
    constructor(
        private jobPostingService: JobPostingService
    ){}

    @Get()
    getJobsForAdmin(@Query() jobFilterDto: JobFilterDto,
    @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.agency)){
            return {show: {type: "error", message: "You don't have permission for this operation"}}
        }
        return this.jobPostingService.getJobsForAdmin(jobFilterDto, user);
    }

    @Get('agency')
    getJobsForAgency(@Query() jobFilterDto: JobFilterDto,
    @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.agency)){
            return this.jobPostingService.getJobsForAgency(jobFilterDto, user);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Get('downloadjd/:jobId')
    downloadJd(
      @Param('jobId') jobId: number): Promise<object> {
      return this.jobPostingService.generatePDF(jobId)
    }

    @Get(':jobId')
    getJobsById(
    @Param('jobId') jobId: number,    
    @Query() jobFilterDto: JobFilterDto,
    @GetUser() user: User
    ){
        return this.jobPostingService.getJobsById(jobId, user);
    }

    @Post()
    createJob(@Body() jobDescriptionDto: JobDescriptionDto,
    @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.jobPostingService.updateJob(null,jobDescriptionDto, user);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Patch(':jobId')
    updateJob(
    @Param('jobId') jobId: number,    
    @Body() jobDescriptionDto: JobDescriptionDto,
    @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.jobPostingService.updateJob(jobId, jobDescriptionDto, user);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Patch('status/:jobId')
    updateJobStatus(
        @Param('jobId') jobId: number,
        @Query('status') status: JobStatus,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.jobPostingService.updateJobStatus(jobId, status);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }
    
}
