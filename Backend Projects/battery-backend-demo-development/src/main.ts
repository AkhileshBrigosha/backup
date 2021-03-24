import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // app.useGlobalPipes(new ValidationPipe({
  //   exceptionFactory: (errors: ValidationError[]) => {
  //     const messages = errors.map(
  //       (error) =>{
  //         if(typeof error.constraints == "undefined" && error.children.length) {
  //           const childError: ValidationError[] = error.children
  //           if(childError.length) {
  //              const childMessages = childError.map((child) => {
  //               const babyError: ValidationError[] = child.children
  //                const babyMessage = babyError.map((babe) =>
  //                 `${Object.values(babe.constraints).join(', ')}`
  //                );
  //                return babyMessage[0];
  //             });
  //             return childMessages[0];
  //           }
  //         } else {
  //            return `${Object.values(error.constraints).join(', ')}`
  //         }
  //       }
  //     )
  //     return new BadRequestException(messages[0]);
  //   },
  //   whitelist: true,
  //   transform: true
  // }));
  await app.listen(3001);
}
bootstrap();
