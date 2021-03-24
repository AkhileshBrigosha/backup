import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { getConnection } from 'typeorm';
import { Request } from '../entities/request.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    // if(req.method !== 'GET'){
      const connection = getConnection('default');
      const request = new Request();
      request.userId = req.user ? req.user.id : null;
      request.method = req.method;
      request.path = req.path;
      request.body = req.body;
      
      connection.manager.save(request);
    // }

    return next
      .handle()
  }
}