import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { getConnection, getManager } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService {

    async getUser(phone: string): Promise<object>{
        const batteryConnection = getConnection('default');
        const manager = getManager(); 
        let res;
        try{
             res = await manager.findOne(User, { phone:phone });
        }catch(e){
           // await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
          //  await queryRunner.release();
        }
        
        return res;
    }
}
