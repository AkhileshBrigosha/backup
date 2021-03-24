import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: './uploads/resume'
    }),
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService]
})
export class CandidatesModule {}
