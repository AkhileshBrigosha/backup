import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HackathonUser } from 'src/entities/hackathon-user.entity';
import { EmailModule } from 'src/common/email/email.module';

@Module({
  imports: [
    // TypeOrmModule.forFeature([HackathonUser]),
    EmailModule
  ],
  providers: [HackathonService],
  controllers: [HackathonController],
})
export class HackathonModule {}
