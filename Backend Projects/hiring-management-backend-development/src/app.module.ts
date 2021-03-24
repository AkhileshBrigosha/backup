import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobPostingModule } from './job-posting/job-posting.module';
import { CandidatesModule } from './candidates/candidates.module';
import { PanelistModule } from './panelist/panelist.module';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as  DailyRotateFile from 'winston-daily-rotate-file';
import { AllExceptionsFilter } from './filters/error-filter';
import { APP_FILTER } from '@nestjs/core';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicApiModule } from './public-api/public-api.module';
import { PocModule } from './poc/poc.module';
import { HackathonModule } from './hackathon/hackathon.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    JobPostingModule,
    CandidatesModule,
    PanelistModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),

        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),

        new winston.transports.File({ filename: 'logs/combined.log' }),

        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error'
        })

      ],
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ]
      // other options
    }),
    RecruitmentModule,
    FeedbackModule,
    DashboardModule,
    PublicApiModule,
    PocModule,
    HackathonModule,
  ],
  providers: [
    {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
    },
  ]
})
export class AppModule {}
