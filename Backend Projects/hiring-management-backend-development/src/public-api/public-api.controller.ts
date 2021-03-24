import { Controller, Get, Param } from '@nestjs/common';
import { PublicApiService } from './public-api.service';

@Controller('public-api')
export class PublicApiController {
    constructor(
        private publicApiService: PublicApiService
    ){}

    @Get('/jobs')
    getAllActiveJobs(){
        return this.publicApiService.getAllActiveJobs();
    }

    @Get('/jobs/:jobId')
    getJobById(
        @Param('jobId') jobId: number
    ){
        return this.publicApiService.getJobById(jobId);
    }
}


