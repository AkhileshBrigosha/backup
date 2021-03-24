/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Controller, Post, Body, ValidationPipe, UsePipes, Put, Query, ParseIntPipe, Get, Res, Render, Param, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto'
// import { PushNotification } from 'src/utils/FCM/-fcm.service';
import { Response } from 'express';
import { CheckTokenDto } from './dto/check-token.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
// import { GetUser } from 'src/shared/decorators/get-user.decorator';
// import { User } from 'src/shared/entity/user.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
//import { MessagePattern } from '@nestjs/microservices';



@Controller('login')
export class LoginController {

    constructor(
        private loginService: LoginService,
        // private notificationService: PushNotification
    ) { }


    @Get('/checktoken')
    updatePassword(
        payload: any
    ): Promise<any> {
        return this.loginService.checkToken(payload)
    }

    @Post('/register')
    generateOtp(
        @Body() payload: RegisterUserDto
    ): Promise<unknown> {
        return this.loginService.generateOtp(payload);
    }

    @Post('/addBattery')
    addBattery(
        @Body() payload: any
    ): Promise<unknown> {
        return this.loginService.generateOtpAddBattery(payload);
    }

    @Post('/verifyOtp')
    verifyOtp(
        @Body() payload: any
    ): Promise<unknown> {
        return this.loginService.verifyOtp(payload);
    }

    // // @Post('forgot-password')
    //  @MessagePattern({ role: 'login', cmd: 'forgot-password' })
    forgotPassword(
        @Body() payload: any
    ): Promise<any> {
        return this.loginService.forgotPassword(payload);
    }


    // // @Post('change-password')
    changePassord(
        @Body() payload: any
    ): Promise<any> {
        return this.loginService.updatePassword(payload);
    }

    // // @UseGuards(AuthGuard())
    // // @Post('set-password')
    // @MessagePattern({ role: 'login', cmd: 'set-password' })
    // setPassord(
    //     @Body() setPasswordDto: LoginCredentialsDto,
    //     // @GetUser() authUser: User
    //     ): Promise<unknown>{
    //         return this.loginService.setPassword(setPasswordDto, authUser);
    // }


    // @Post()
    //  @MessagePattern({ role: 'login', cmd: 'signin' })
    signIn(
        payload: any
    ): Promise<any> {
        return this.loginService.signIn(payload);
    }



    // @Post('/push')
    // test(){
    //     return this.notificationService.send({title: "Test", text: "Well hello"}, []);
    // }

    // @Post('/refresh')
    // @MessagePattern({ role: 'login', cmd: 'refresh' })
    // genToken(
    //     // @GetUser() user: User,
    //     @Body('refreshToken') refreshToken: string,
    // ): Promise<unknown>{
    //     return this.loginService.genToken(user.id, refreshToken);
    // }
}
