import { Module } from '@nestjs/common';
import { PanelistController } from './panelist.controller';
import { PanelistService } from './panelist.service';
import { AuthModule } from '../auth/auth.module';
import { JobPostingService } from '../job-posting/job-posting.service';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [PanelistController],
  providers: [PanelistService, JobPostingService]
})
export class PanelistModule {}
