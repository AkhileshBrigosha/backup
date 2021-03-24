import { Controller, Post, Body, Patch, Query, Get } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-crendentials.dto';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ){}

    @Get('/checktoken')
    checkToken(
        @Query('userId') userId: number,
        @Query('token') token: string
    ): Promise<object>{
        return this.authService.checkToken(userId, token);
    }

    @Get('/accesstoken')
    getAccessToken(
        @Query('userId') userId: number,
        @Query('refreshToken') refreshToken: string
    ): Promise<object>{
        return this.authService.getAccessToken(userId, refreshToken);
    }
   
    @Post('/signin')
    signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<object>{
        return this.authService.signIn(authCredentialsDto);
    }

    @Post('/forgotpassword')
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<object>{
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Patch('/updatepassword')
    updatePassword(@Body() updatePasswordDto: UpdatePasswordDto): Promise<object>{
        return this.authService.updatePassword(updatePasswordDto);
    }


}
