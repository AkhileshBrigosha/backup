import { Module } from '@nestjs/common';
import { JobPostingController } from './job-posting.controller';
import { JobPostingService } from './job-posting.service';
import { AuthModule } from '../auth/auth.module';
import { RecruitmentService } from '../recruitment/recruitment.service';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [JobPostingController],
  providers: [JobPostingService, RecruitmentService]
})
export class JobPostingModule {}
