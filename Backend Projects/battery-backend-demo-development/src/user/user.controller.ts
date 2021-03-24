import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    //batteryStatusService: any;
    


    constructor(
        private userService: UserService,
    ){}

    @Get('/:phone')
    getBatteryStatus(@Param('phone') phone: string){
        return this.userService.getUser(phone);
    }
}
