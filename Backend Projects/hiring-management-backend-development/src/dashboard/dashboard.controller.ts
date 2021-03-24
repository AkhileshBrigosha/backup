import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { GetUser } from 'src/users/get-user.decorator';
import { UserRole } from 'src/users/enums/user.enum';

@Controller('dashboard')
@UseGuards(AuthGuard())
export class DashboardController {
    constructor(
        private dashboardService: DashboardService,
    ){}

    @Get('interviews')
    getTodayInterview(
        @Query('date') date: string,
        @Query('search') search: string,
        @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin) || user.role.includes(UserRole.agency)){
            return this.dashboardService.getTodayInterview(user, date, search);  
        }
    }

    @Get('testMail')
    getTestMail(){
        return this.dashboardService.testmail();
    }
}
