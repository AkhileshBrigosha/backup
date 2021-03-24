import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserCreateDto } from './dto/user-create.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserRole, UserRoleDisplay, UserStatus, UserDesignation } from './enums/user.enum';
import { getConnection, In } from 'typeorm';
import { Agency } from '../entities/agency.entity';
import { AgencyCreateDto } from './dto/agency-create.dto';
import { AgencyFilterDto } from './dto/agency-filter.dto';
import { AgencyStatus } from './enums/agency.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailDto } from '../common/email/dto/email.dto';
import * as config from 'config';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/user.entity';
@Injectable()
export class UsersService {
    constructor(
        private readonly mailerService: MailerService
    ){}

    async getUsers(userFilterDto: UserFilterDto): Promise<object>{
        const { search, status, role } = userFilterDto;
        const userConnection = getConnection('default');
        const query = userConnection.getRepository(User).createQueryBuilder('user');

        if(search){
            query.where('(user.name LIKE :search OR user.email LIKE :search OR user.phone LIKE :search)', {search: `%${search}%`});
        }
        
        if(role){
            query.andWhere('user.role @> ARRAY[:role::user_role_enum]', {role});
        }else{
            query.andWhere('user.role && ARRAY[:...role::user_role_enum]', {role: [UserRole.admin, UserRole.hr, UserRole.shortlister, UserRole.superAdmin]});
        }

        if(status){
            query.andWhere('user.status = :status', {status});
        }else{
            query.andWhere('user.status = :status', {status: UserStatus.approved});
        }
        
        const users = await query.leftJoinAndSelect('user.agency', 'agency').orderBy('user.createdAt','DESC').getMany();

        const response = {
            "users": users,
            "userRole": Object.values(UserRoleDisplay),
            "userStatus": Object.values(UserStatus),
            "designations": Object.values(UserDesignation)
        }
        return response;
    }

    async getUserById(userId: number){
        const userConnection = getConnection('default');
        const user = await userConnection.getRepository(User).findOne({
            relations: ['agency'],
            where: {id: userId}
        });

        if(!user){
            return {show:{type:'error', message:'No user found'}}
        }

        return user
    }

    async getAgencies(agencyFilterDto: AgencyFilterDto): Promise<object>{
        const { search, status } = agencyFilterDto;
        const userConnection = getConnection('default');
        const query = userConnection.getRepository(Agency).createQueryBuilder('agency');

        if(search){
            query.where('(agency.agencyName LIKE :search OR agency.location LIKE :search)', {search: `%${search}%`});
        }

        if(status){
            query.andWhere('agency.status = :status', {status});
        }else{
            query.andWhere('agency.status = :status', {status: AgencyStatus.approved});
        }

        const agencies = await query.leftJoinAndSelect('agency.users', 'users')
                                    .orWhere('users.status = :userStatus', {userStatus: UserStatus.approved})
                                    .orderBy('agency.createdAt','DESC').getMany();

        const response = {
            "agency": agencies,
            "agency-status": AgencyStatus
        }
        return response;
    }

    async getAgencyById(agencyId: number){
        const userConnection = getConnection('default');
        const query = userConnection.getRepository(Agency).createQueryBuilder('agency');
        const agency = await query.leftJoinAndSelect('agency.users', 'users')
                    .orWhere('users.status = :userStatus', {userStatus: UserStatus.approved})
                    .andWhere('agency.id = :agencyId', {agencyId})
                    .getOne();
        
        if(!agency){
            return {show:{type:'error', message:'No agency found'}}
        }

        return agency.users;
    }

    async updateUser(userId: number, userCreateDto: UserCreateDto, userRole: UserRole[]): Promise<object> {
        const { name, email, phone, role, designation, primaryContact } = userCreateDto;
        const userConnection = getConnection('default');
        const queryRunner = userConnection.createQueryRunner();
        await queryRunner.connect();
        let user = await queryRunner.manager.findOne(User, {id: userId});
        
        const agency = await queryRunner.manager.findOne(Agency, {id: 1});

        if(!agency){
            return {show: {type: 'error', message: 'Create an agency named Brigosha'}};
        }
        
        if(!user){
            user = await new User();       
        }
            
        user.name  = name;
        user.email  = email.toLowerCase();
        user.phone  = phone;
        user.role  = role;
        user.designation = designation;
        user.primaryContact = role.includes(UserRole.admin) ? true : false;
        user.agency = agency ? agency : null;
        user.passwordToken = userId ? user.passwordToken : uuidv4();
        user.status = UserStatus.approved;
       
        await queryRunner.startTransaction();
        try{
            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e); 
        } finally{
            await queryRunner.release();
        }
        
        if(!userId){
            this.sendMail(user,user.passwordToken);
        }
        
        return {show: {type: 'success', message: 'User created successfully'}, user};
    }

    async updateAgency(agencyId: number, agencyCreateDto: AgencyCreateDto, userRole: UserRole[]): Promise<any> {
        const { agencyName, location, otherDetails, users, deleted } = agencyCreateDto;
        const userConnection = getConnection('default');
        
        const queryRunner = userConnection.createQueryRunner();
        
        await queryRunner.connect();

        let agency = await queryRunner.manager.findOne(Agency, {id: agencyId});
        
        if(!agency){
            agency = new Agency();       
        }
            
        agency.agencyName  = agencyName;
        agency.location  = location;
        agency.otherDetails  = otherDetails;
        
        const usersArray = [];
        let savedAgency, newUser = false;
        await queryRunner.startTransaction();
        try{
            savedAgency = await queryRunner.manager.save(agency);
            
            if(users){
                for(const user of users) {
                    let agencyUser = await queryRunner.manager.findOne(User,{id:user.id});
                    
                    if(!agencyUser){
                        agencyUser = new User();
                        newUser = true;
                    }
                    agencyUser.name = user.name;
                    agencyUser.email = user.email.toLowerCase();
                    agencyUser.phone = user.phone;
                    agencyUser.primaryContact = user.primaryContact;
                    agencyUser.role = [UserRole.agency];
                    agencyUser.agency = savedAgency;
                    agencyUser.passwordToken = newUser ? uuidv4() : agencyUser.passwordToken;
                    agencyUser.status = UserStatus.approved;

                                        
                    const savedUser = await queryRunner.manager.save(agencyUser);
                    if(newUser){
                        usersArray.push(savedUser);
                    }
                };
            }
            if(deleted && deleted.length > 0){
                const deletedUsers = await queryRunner.manager.find(User,{id: In(deleted)});
                if(deletedUsers){
                    for(const deletedUser of deletedUsers){
                        deletedUser.status = UserStatus.deleted;
                        await queryRunner.manager.save(deletedUser); 
                    }
                }
            }
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e); 
        } finally{
            await queryRunner.release();
        }
        
        usersArray.forEach(user => {
            this.sendMail(user,user.passwordToken);  
        })

        if(agencyId){
            return {show: {type: 'success', message: 'Agency updated successfully'}, agency, users: await this.getAgencyById(agencyId)}
        }
        return {show: {type: 'success', message: 'Agency created successfully'}, agency, users:await this.getAgencyById(savedAgency.id)};

    }

    async deleteUser(userId: number): Promise<object> {
        const userConnection = getConnection('default');
        const user = await userConnection.manager.findOne(User, {id: userId});
        
        if(!user){
            return {show: {type: 'error', message: 'User not found'}};
        }
        if(user.role.includes(UserRole.superAdmin)){
            return {show: {type: 'error', message: "Can't delete admin"}};
        }
        user.status = UserStatus.deleted;
        user.password = null;
        user.salt = null;
        try{
            await userConnection.manager.save(user);
        }catch(e){
            throw new InternalServerErrorException(e);
        }
        
        return {show: {type: 'success', message: 'User deleted successfully'}}
    }

    async deleteAgency(agencyId: number): Promise<object> {
        const userConnection = getConnection('default');
        const queryRunner = userConnection.createQueryRunner();
        await queryRunner.connect();
        const agency = await queryRunner.manager.findOne(Agency, {id: agencyId});
        const agencyUsers = await queryRunner.manager.find(User, {where: {agency: agency.id}});
        
        let show = {}
        if(!agency){
            show={
                type: 'error',
                message: 'Agency not found'
            }
        }
        
        agency.status = AgencyStatus.deleted;
        await queryRunner.startTransaction();
        try{
            if(agencyUsers){
                for(const user of agencyUsers) {
                    user.status = UserStatus.deleted;
                    user.password = null;
                    user.salt = null;
                    await queryRunner.manager.save(user);
                }
            }
            await queryRunner.manager.save(agency);
            await queryRunner.commitTransaction();
        }catch(e){
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
            await queryRunner.release();
        }
        
        return {show: {type: 'success', message: 'Agency deleted successfully'}}
    }

    async sendMail(user: User, token: string){
        const { frontendBaseUrl } = config.get('frontendserver');
        const { baseUrl } = config.get('backendserver');
        const request: EmailDto = {
            to: user.email,
            subject: 'Welcome to Brigosha Hiring Management',
            template: 'welcomemail',
            context: {
            link: frontendBaseUrl+'/auth/checktoken?userId='+user.id+'&token='+token,
            username: user.name,
            email: user.email,
            },
            attachments:[
                {
                filename : 'bottom_border@2x.png',
                path: baseUrl+'/assets/bottom_border@2x.png',
                cid : 'bottom_border@2x'
                },
                {
                filename : 'logo-color.png',
                path: baseUrl+'/assets/brigosha-logo@2x.png',
                cid : 'logo-color'
                },
            ]
        }

        await this.mailerService.sendMail(request)
        .then((success) => {
            console.log(success);
        })
        .catch((err) => {
            console.log(err)
        });
    }
}
