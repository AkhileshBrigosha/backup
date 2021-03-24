import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
  } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { getConnection } from 'typeorm';
import { Request } from '../entities/request.entity';

  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger){};
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const req = ctx.getRequest();
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      
      const timeStamp = new Date().toLocaleDateString();
      const userId = req.user ? req.user.id : null;
      const errorResponse = {
        statusCode: status,
        message: exception.message,
        path: req.url,
        show: {
          type: 'error', 
          message: exception.message
        }
      }
      
      // if(req.method !== 'GET'){
        const connection = getConnection('default');
        const request = new Request();
        request.userId = req.user ? req.user.id : null;
        request.method = req.method;
        request.path = req.path;
        request.body = req.body;
        request.error = exception;
        connection.manager.save(request);
      // }
     
      this.logger.error({"statusCode": status, "timestamp": timeStamp, "path": req.url, userId: userId, "error": exception});

      response.status(status).json(errorResponse);
    }
  }