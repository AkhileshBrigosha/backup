import { Controller, Body, Post, UseGuards, Param, Get, Query, Patch, Delete } from '@nestjs/common';
import { UserCreateDto } from './dto/user-create.dto';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { GetUser } from './get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserRole } from './enums/user.enum';
import { AgencyCreateDto } from './dto/agency-create.dto';
import { AgencyFilterDto } from './dto/agency-filter.dto';


@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
    constructor(
        private usersService: UsersService,
    ){}

    @Get()
    getUsers(
        @GetUser() user: User,
        @Query() userFilterDto: UserFilterDto,
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.usersService.getUsers(userFilterDto);
        }

        return {show: {type: "error", message: "You don't have permission for this operation"}};
    }

    @Get('agency')
    getAgencies(
        @GetUser() user: User,
        @Query() agencyFilerDto: AgencyFilterDto,
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.usersService.getAgencies(agencyFilerDto);
        }

        return {show: {type: "error", message: "You don't have permission for this operation"}};
    }

    @Get(':userId')
    getUserById(
        @GetUser() user: User,
        @Param('userId') userId: number
    ){
        if(user.role.includes(UserRole.superAdmin)|| user.role.includes(UserRole.admin)){
            return this.usersService.getUserById(userId);
        }

        return {show: {type: "error", message: "You don't have permission for this operation"}};
    }

    @Get('agency/:agencyId')
    getAgencyById(
        @GetUser() user: User,
        @Param('agencyId') agencyId: number
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.usersService.getAgencyById(agencyId);
        }

        return {show: {type: "error", message: "You don't have permission for this operation"}};
    }
    
    @Post()
    userCreate(@Body() userCreateDto: UserCreateDto,
    @GetUser() user: User,
    ){      
        if(user.role.includes(UserRole.superAdmin)){
            return this.usersService.updateUser(null, userCreateDto, user.role);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Post('agency')
    agencyCreate(@Body() agencyCreateDto: AgencyCreateDto,
    @GetUser() user: User,
    ){      
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.usersService.updateAgency(null, agencyCreateDto, user.role);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Patch('/:userId')
    updateUser(
        @Param('userId') userId: number,
        @Body() userCreateDto: UserCreateDto,
        @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.superAdmin)){
            return this.usersService.updateUser(userId, userCreateDto, user.role);
        }

        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Patch('agency/:agencyId')
    agencyUpdate(
        @Param('agencyId') agencyId: number,
        @Body() agencyCreateDto: AgencyCreateDto,
        @GetUser() user: User,
    ){      
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.usersService.updateAgency(agencyId, agencyCreateDto, user.role);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Delete('/:userId')
    deleteUser(
        @Param('userId') userId: number,
        @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.superAdmin)){
            return this.usersService.deleteUser(userId);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }

    @Delete('agency/:agencyId')
    deleteAgency(
        @Param('agencyId') agencyId: number,
        @GetUser() user: User,
    ){
        if(user.role.includes(UserRole.superAdmin) || user.role.includes(UserRole.admin)){
            return this.usersService.deleteAgency(agencyId);
        }
        return {show: {type: "error", message: "You don't have permission for this operation"}}
    }
}
