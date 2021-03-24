import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createConnection } from 'typeorm';
import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {

  const connections = await createConnection();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { port } = config.get('server');

  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
 
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
      const messages = errors.map(
        (error) =>{
          if(typeof error.constraints == "undefined" && error.children.length) {
            const childError: ValidationError[] = error.children
            if(childError.length) {
               const childMessages = childError.map((child) => {
                const babyError: ValidationError[] = child.children
                 const babyMessage = babyError.map((babe) =>
                  `${Object.values(babe.constraints).join(', ')}`
                 );
                 return babyMessage[0];
              });
              return childMessages[0];
            }
          } else {
             return `${Object.values(error.constraints).join(', ')}`
          }
        }
      )
      return new BadRequestException(messages[0]);
    },
    whitelist: true,
    transform: true
  }));
  
  await app.listen(port, ()=> console.log(`Hiring Management running on port ${port}`));
}
bootstrap();
