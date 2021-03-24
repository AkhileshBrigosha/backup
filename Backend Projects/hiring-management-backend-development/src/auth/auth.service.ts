import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-crendentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { getConnection } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserStatus } from '../users/enums/user.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailDto } from '../common/email/dto/email.dto';
import * as config from 'config';
import { v4 as uuidv4 } from 'uuid';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,    
        private readonly mailerService: MailerService
    ){}

   

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<any>{   
        const {email, password} = authCredentialsDto;     
        const authConnection = getConnection('default')

        const user = await authConnection.getRepository(User).createQueryBuilder('user')
                                            .where('user.email = :email', {email : email.toLowerCase()})
                                            .addSelect(['user.password', 'user.salt', 'user.refreshToken'])
                                            .getOne();
        
        if(!user){
            return {show:{type:'error',message:'User not registered'}}
        }

        if(!user.salt){
            return {show:{type:'error',message:'Password not set'}}
        }

        const hash = await bcrypt.hash(password, user.salt);

        if(hash !== user.password){
            return {show:{type:'error',message:'Incorrect password'}}
        }
    
        const payload: JwtPayload =  { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        const accessToken = await this.jwtService.sign(payload);

        const data = {
            "accessToken": accessToken,
            "refreshToken": user.refreshToken,
            "user": payload
        }
        return data;
    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<object>{
        const {userId, password} = updatePasswordDto;
        const authConnection = getConnection('default')

        try{
            const user = await authConnection.manager.findOne(User,{ id: userId });
            if(!user){
                return {show:{
                    type: 'error',
                    message: 'User not registered'
                }}
            }
            user.salt = await bcrypt.genSalt();        
            user.password = await this.hashPassword(password, user.salt);
            user.passwordToken = uuidv4();
            user.refreshToken = uuidv4();
            await user.save();
        }catch(error){
            throw new InternalServerErrorException(error); 
        }  
        
        return {show:{
            type: 'success',
            message: 'Password updated succesfully'
        }}
    }

    private async hashPassword(password: string, salt: string): Promise<string>{
        return bcrypt.hash(password, salt);
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<object>{
        const { email } = forgotPasswordDto;
        const authConnection = getConnection('default');

        const user = await authConnection.manager.findOne(User,{
            where: [
                { email, status: UserStatus.approved}
            ]
        });

        if(!user){
            return {show:{type:'error', message:'Email id not registered'}}
        }

        user.passwordToken = uuidv4();

        try{
            await authConnection.manager.save(user);
        }catch(e){
            throw new InternalServerErrorException(e);
        }

        this.sendMail(user, user.passwordToken);

        return {show:{type:'success',message:'Forgot password link sent to you email successfully'}}
    }

    async checkToken(userId: number, token: string): Promise<object>{
        const authConnection = getConnection('default');

        const user = await authConnection.manager.findOne(User, {
            where: [{id: userId, passwordToken: token}]
        });

        if(!user){
            return {show:{type:'error', message: 'Invalid userId or token'}};
        }

        delete user.password;
        delete user.salt;
        
        return {show: {type: 'success', message: 'Token verified'}, user};
    }

    async getAccessToken(userId: number, refreshToken: string): Promise<object>{
        const authConnection = getConnection('default')

        const user = await authConnection.getRepository(User).createQueryBuilder('user')
                                            .where('user.id = :userId', {userId})
                                            .andWhere('user.refreshToken = :refreshToken', {refreshToken})
                                            .getOne();
        if(!user){
            return {show:{type: 'success', message: 'Password updated succesfully'}}
        }

        const payload: JwtPayload =  { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        const accessToken = await this.jwtService.sign(payload);

        const data = {
            "accessToken": accessToken,
            "user": payload
        }
        
        return data;
    }

    async sendMail(user: User, token: string){
        const { frontendBaseUrl } = config.get('frontendserver');
        const { baseUrl } = config.get('backendserver');
        const request: EmailDto = {
            to: user.email,
            subject: 'Forogt Password',
            template: 'forgotpassword',
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
                }
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
