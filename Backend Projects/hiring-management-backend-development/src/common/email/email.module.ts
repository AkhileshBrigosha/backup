import { Module } from '@nestjs/common';
import {  MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as config from 'config';

const emailConfig = config.get('smtp');
@Module({
    imports: [MailerModule.forRoot({
    
        transport: {
            host: process.env.SMTP_HOST || emailConfig.host, //'smtp.sendgrid.net',
            port: process.env.SMTP_PORT || emailConfig.port,
            secure: emailConfig.secure, // upgrade later with STARTTLS
            tls: {
              rejectUnauthorized: false,
              ciphers: 'SSLv3'
            },
            auth: {
              user: process.env.SMTP_USER || emailConfig.user,
              pass: process.env.SMTP_PASSWORD || emailConfig.password,
            },
        },
        defaults: {
          from:process.env.SMTP_FROM || emailConfig.from,
        },
        template: {
          dir: process.cwd() + '/email-templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter()
          options: {
            strict: true,
          },
        },
      }),],
    providers: []
})
export class EmailModule {}
