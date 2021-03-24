import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { JwtPayload } from './jwt-payload.interface';
import { getConnection } from 'typeorm';
import * as config from 'config';

const { secret } = config.get('jwt');
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload){
        const {email}  = payload;

        if(email !== 'admin@brigosha.com'){
            throw new UnauthorizedException();
        }

        return {email}
    }
}
