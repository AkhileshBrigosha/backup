import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { OtpGeneratorService } from 'src/utils/otp-generator.service';

@Module({
  imports: [
  
  ],
  controllers: [LoginController],
  providers: [
    LoginService,
    OtpGeneratorService
  ],

  exports: [

  ]


})
export class LoginModule {

}
