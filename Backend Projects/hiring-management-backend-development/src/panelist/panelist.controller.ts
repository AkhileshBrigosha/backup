import { Controller, UseGuards, Post, Body, Get, Query, Param, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PanelistService } from './panelist.service';
import { CreatePanelistDto } from './dto/create-panelist.dto';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../entities/user.entity';
import { PanelistFilterDto } from './dto/panelist-filter.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UserRole } from '../users/enums/user.enum';

@Controller('panelist')
@UseGuards(AuthGuard())
export class PanelistController {
    constructor(
        private panelistService: PanelistService
    ){}

    @Get()
    getPanelist(
        @Query() panelistFilterDto: PanelistFilterDto,
        @Query('schedule') schedule: boolean,
        @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.panelistService.getPanelist(schedule, panelistFilterDto);       
        }
        return {show:{type:'error',message:'You dont have permission for this operation'}};
    }

    @Get('/:panelistId')
    getPanelistById(
        @Param('panelistId') panelistId: number,
        @Query('schedule') schedule: boolean,
        @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.panelistService.getPanelistById(schedule,panelistId);
        }
        return {show:{type:'error',message:'You dont have permission for this operation'}}
    }

    @Post()
    createPanelist(@Body() createPanelistDto: CreatePanelistDto,
    @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.panelistService.updatePanelist(null, createPanelistDto);
        }
        return {show:{type:'error',message:'You dont have permission for this operation'}}
    }

    @Post('schedule')
    createSchedule(@Body() createScheduleDto: CreateScheduleDto,
    @GetUser() user: User
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.panelistService.updateSchedule(createScheduleDto);
        }
        return {show:{type:'error',message:'You dont have permission for this operation'}}
    }


    @Patch('/:panelistId')
    updatePanelist(
        @Param('panelistId') panelistId: number,
        @Body() createPanelistDto: CreatePanelistDto,
        @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.panelistService.updatePanelist(panelistId, createPanelistDto);
        }
        return {show:{type:'error',message:'You dont have permission for this operation'}}
    }

    @Delete('/:panelistId')
    deletePanelist(
        @Param('panelistId') panelistId: number,
        @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.panelistService.deletePanelist(panelistId);
        }
        return {show:{type:'error',message:'You dont have permission for this operation'}}
    }
}
