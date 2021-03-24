/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginCredentialsDto } from './dto/login-credentials.dto'
import { CheckTokenDto } from './dto/check-token.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
//import { MailerService } from '@nestjs-modules/mailer';
import { v1 as uuidv1 } from 'uuid';
import { User } from '../entities/user.entity';
//import { EmailDto } from 'src/utils/email/dto/email.dto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
//import * as config from 'config';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';
import { OtpGeneratorService } from '../utils/otp-generator.service';
//import { Status } from '../shared/enum/request.enum';
//import { UserRole } from '../shared/enum/user.enum';
import { getConnection, getManager, getMongoManager, getMongoRepository } from 'typeorm';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { UserBatteryEmbedded } from 'src/entities/userBatteryEmbedded.entity';
//import { RpcException } from '@nestjs/microservices';

@Injectable()
export class LoginService {

    constructor(

      //  private readonly mailerService : MailerService,
        // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,

        private otpGeneratorService: OtpGeneratorService


    ) {}


    async updatePassword(payload: any){
        const { userId, password } = payload.params;

        let show;

        const userConnection =  getConnection(payload.org.id);
        const user = await userConnection.getRepository(User).findOne({ id: userId });

        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password, user.salt);
        user.passwordToken = uuidv1();
        const saved = await userConnection.manager.save(user);
        if(saved){
            show = {
                type: 'success',
                message: 'Your password has been updated successfully!'
            }
        }else{
            show = {
                type: 'error',
                message: 'Unable to updated password! Please try again.'
            }
        }
        return {show};
    }


    async signIn(payloadparam: any): Promise<any> {

        const { email, password, url } = payloadparam.params;
        const userConnection =  getConnection(payloadparam.org.id);

        const user = await userConnection.getRepository(User).createQueryBuilder('user')
        .leftJoinAndSelect('user.student', 'student')
        // .leftJoinAndSelect('student.standard', 'std')
        .where({email: email})
        .addSelect('user.password')
        .addSelect('user.salt')
        .getOne();


        // if (!user || !user.password || !await user.validatePassword(password)) {
        //     return false
        // }

        return user;
    }

    async checkToken(checkTokenDto: any): Promise<any>{
        const {userId, token} = checkTokenDto.params;

        const userConnection =  getConnection(checkTokenDto.org.id);

        const user = await userConnection.getRepository(User).createQueryBuilder('user')
        .where({id: userId})
        .addSelect('user.passwordToken')
        .getOne();

        let show = {};
        if(!user || user.passwordToken !== token){
            show = {
                type: 'error',
                message: 'Invalid Token'
            }

            return {show: show};
        }

        return user;
    }


    // async genToken(
    //     userId: number,
    //     refreshToken: string,
    //     ): Promise<unknown>{
    //         const user = await this.userRepository.findOne(userId);
    //         let response = {};

    //         if(!user || user.token != refreshToken){
    //             const show = {
    //                 type: 'error',
    //                 message: "Invalid Token"
    //             }
    //             return {show}
    //         }
    //         const payload: JwtPayload =  {
    //             id: user.id,
    //             email: user.email,
    //             };
    //         const accessToken = await this.jwtService.sign(payload) || "";
    //         refreshToken = user.token

    //         response = {
    //             data: {
    //                 accessToken: accessToken,
    //                 refreshToken: refreshToken,
    //             }
    //         }
    //         return response;
    // }


    async forgotPassword(payload: any): Promise<any>{
        const { phone } = payload.params;

        const userConnection =  getConnection(payload.org.id);

        const user = await userConnection.getRepository(User).findOne({phone:phone});

        let show = {}
        if(!user || user == undefined){
            return {
              show: {
                type: 'error',
                message: 'Email ID not found, kindly contact the admin'
              }
            }
        }
        user.passwordToken = uuidv1();
        try{
            await userConnection.manager.save(user);
        }catch(error){
            return show = {
                type: 'error',
                message: error
            }
        }

      //   this.sendMail(user, user.passwordToken);

        return {show: {
            type: 'success',
            message: 'Please click on the link sent to your registered email'
        }}
    }


    //  sendMail(user: User, token: string){
    //     const { baseUrl } = config.get('server');
    //     const { frontendBaseUrl } = config.get('frontendserver');

    //     const request: EmailDto= {
    //         to: user.email,
    //         // cc: 'kooljit.das@brigosha.com',
    //         subject: 'Vectors Digital Classroom Password Reset Link',
    //         template: 'forgotpassword',
    //         context: {
    //         link: frontendBaseUrl+'/login/checktoken?userId='+user.id+'&token='+token,
    //         username: user.name,
    //         },
    //         attachments:[
    //             {
    //             filename : 'bottom_border@2x.png',
    //             path: 'src/../public/assets/bottom_border@2x.png',
    //             cid : 'bottom_border@2x'
    //             },
    //             {
    //             filename : 'logo-color.png',
    //             path: 'src/../public/assets/logo-color.png',
    //             cid : 'logo-color'
    //             }
    //         ]

    //     }
    //      this.mailerService.sendMail(request)
    //     .then((success) => {
    //         console.log(success)
    //         // this.logger.info(
    //         //     `EMAIL:${request.to} ${success} ${Date.now()}ms`,
    //         //     'EMAILSERVICE',
    //         //   )
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //         // this.logger.error(
    //         //     `EMAIL:${request.to} ${err} ${Date.now()}ms`,
    //         //     'EMAILSERVICE',
    //         //   )
    //     });
    // }


    async hashPassword(password: string, salt: string): Promise<string>{
        return await bcrypt.hash(password, salt);
    }

    // async setPassword(setPasswordDto: LoginCredentialsDto, authUser: User): Promise<unknown>{
    //   const { email, password } = setPasswordDto;
    //   if(authUser.id !== 3 && authUser.id !== 2){
    //     const show = {
    //       type: 'error',
    //       message: 'You do not have the permission to perform this action'
    //     }
    //     return {show};
    //   }
    //   const user = await this.userRepository.createQueryBuilder('user')
    //                       .where({email: email}).getOne();
    //   if(!user){
    //     const show = {
    //       type: 'error',
    //       message: 'Sorry! User not found. Please check the email'
    //     }
    //     return {show};
    //   }
    //   user.salt = await bcrypt.genSalt();
    //   user.password = await this.hashPassword(password, user.salt);

    //   try{
    //       await user.save();
    //       const show = {
    //           type: 'success',
    //           message: 'Password set successfully'
    //       }
    //       return {show}
    //   }catch(error){
    //       const show = {
    //           type: 'error',
    //           message: 'Unable to set password. Please contact admin/developer'
    //       }
    //       return {show}
    //   }

    // }

    async generateOtp(payload: any): Promise<any> {
        let show = {};

        const phone= payload.mobileNumber;  
        const userConnection =  getConnection("default");
        const manager = getMongoManager();
        let user = await manager.findOne(User, { phone:phone });

        if(!user){
            user = await new User();
            user.phone=payload.mobileNumber
        }
            if(user){
               const data = await this.otpGeneratorService.otpGen(payload);

                if(data.Response === "6"){
                    user.sessionId = data.sessionToken;
                    user.fName=payload.FirstName
                    user.lName=payload.LastName
                    user.pinCode=payload.Pincode
                    user.userBatteryEmbedded=[
                        new UserBatteryEmbedded(payload.batterySerialNumber,payload.purchaseDate,new Date(),"","B","2")
                    ]
                
                    await userConnection.manager.save(user);
                    show = {
                        type: 'success',
                        message: 'OTP sent successfully'
                    }
                }else{
                  show = {
                        type: 'error',
                        message: 'Unable to send OTP at the moment'
                    }
                }
                return {show};
            }else{
             show = {
                type: 'error',
                message: 'User does not exist'
            }

            return {show};
        }
    }

    async generateOtpAddBattery(payload: any): Promise<any> {
        let show = {};

        const phone= payload.mobileNumber;
     
        const userConnection =  getConnection("default");
        let userRepository = getMongoRepository(User);

        const user = await userRepository.findOne({ phone: phone })
            if(user){
               const data = await this.otpGeneratorService.otpGen(payload);

                if(data.Response === "6"){
                    user.sessionId = data.sessionToken;
                    // user.userBatteryEmbedded=[
                    //     new UserBatteryEmbedded(payload.batterySerialNumber,payload.purchaseDate,new Date(),payload.vehicleRegistrationNumber,"H","2")
                    // ]
                    //user.
                    const u= new UserBatteryEmbedded(payload.batterySerialNumber,payload.purchaseDate,new Date(),payload.vehicleRegistrationNumber,"H","2");
                    await  userRepository.findOneAndUpdate({ phone: phone },
                        { $push: { userBatteryEmbedded: u}}, {})
                    show = {
                        type: 'success',
                        message: 'OTP sent successfully'
                    }
                }else{
                  show = {
                        type: 'error',
                        message: 'Unable to send OTP at the moment'
                    }
                }
                return {show};
            }else{
             show = {
                type: 'error',
                message: 'User does not exist'
            }

            return {show};
        }
    }


    async verifyOtp(payload: any): Promise<any> {
        const {otp, phoneNo, url} = payload.params;
        const userConnection =  getConnection(payload.org.id);
        const manager = getMongoManager();
        const user = await manager.findOne(User, { phone:phoneNo });

        if(user){
            const data = await this.otpGeneratorService.verOtp(user.sessionId, otp);
            if(data.Response === "2"){
                return user
            }else{
                return 'fail'
            }

        }else{
            return false
        }
    }

}
