import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { getConnection } from 'typeorm';
import { Agency } from '../entities/agency.entity';
import * as moment from 'moment';
import { UserRole } from '../users/enums/user.enum';
import { Candidates } from '../entities/candidates.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as CryptoJS from 'crypto-js';
import * as config from 'config';
import { InterviewSlotStatus } from '../recruitment/enum/recruitment.enum';
const { key } = config.get('cipher');

@Injectable()
export class DashboardService {
    constructor(
        private mailerService: MailerService,
    ){}

    async getTodayInterview(user: User, date: string, search: string): Promise<object>{
        const dashboardConnection = getConnection('default');
        const userAgency = await dashboardConnection.getRepository(Agency).createQueryBuilder('agency')
                                                    .innerJoin('agency.users', 'user')
                                                    .where('user.id = :userId', {userId: user.id})
                                                    .getOne();
        
        
        const dateSelected = date ? date : moment().format('y-MM-D');

        const query = dashboardConnection.getRepository(Candidates).createQueryBuilder('candidate')
                                                .leftJoinAndSelect('candidate.interviewSlots', 'interviewSlots')
                                                .leftJoinAndSelect('interviewSlots.schedule', 'schedule')
                                                .leftJoinAndSelect('interviewSlots.panelist', 'panelist')
                                                .leftJoinAndSelect('candidate.feedback', 'feedback')
                                                .leftJoinAndSelect('candidate.jobs','job')
                                                .leftJoinAndSelect('candidate.agency', 'agency')
                                                .where('interviewSlots.date = :dateSelected', {dateSelected})
                                                .andWhere('interviewSlots.interviewStatus != :status', {status: InterviewSlotStatus.skipped});
        
        if(user.role.includes(UserRole.agency)){
            query.andWhere('agency.id = :agencyId', {agencyId: userAgency.id})
        }
        if(search){
            query.andWhere('(candidate.name LIKE :search OR candidate.email LIKE :search OR candidate.phone LIKE :search)', {search: `%${search}%`})
        }
                                                
        const candidatesRaw = await query.orderBy('candidate.createdAt', 'DESC').getMany();
        
        const candidates = candidatesRaw.map(candidate => {
            candidate.currentCtc = candidate.currentCtc ? CryptoJS.AES.decrypt(candidate.currentCtc, key).toString(CryptoJS.enc.Utf8) : null;
            candidate.expectedCtc = candidate.expectedCtc ? CryptoJS.AES.decrypt(candidate.expectedCtc, key).toString(CryptoJS.enc.Utf8) : null;
            return candidate;
        })

        return candidates;
    }

    async testmail(){
        const { baseUrl } = config.get('backendserver');
        // const {to, cc, username, subject, template, candidateName, job, interviewDate, interviewSlot} = params;
        let content = 'BEGIN:VCALENDAR\n' +
        'VERSION:2.0\n' +
        'BEGIN:VEVENT\n' +
        'SUMMARY:Summary123\n' +
        'DTSTART;VALUE=DATE:20201127T093000Z\n' +
        'DTEND;VALUE=DATE:20201127T113000Z\n' +
        'LOCATION:Ghar Se \n' +
        'DESCRIPTION:Description123\n' +
        'STATUS:CONFIRMED\n' +
        'SEQUENCE:3\n' +
        'BEGIN:VALARM\n' +
        'TRIGGER:-PT10M\n' +
        'DESCRIPTION:Description123\n' +
        'ACTION:DISPLAY\n' +
        'END:VALARM\n' +
        'END:VEVENT\n' +
        'END:VCALENDAR';
        const mailOption = {
            to: 'sumesh.agarwal@brigosha.com',
            // cc: cc,
            subject: 'test mail',
            template: 'testMail',
            context: {
            
            },
            icalEvent: {
              filename: "invitation.ics",
              method: 'request',
              content: content
            }
            
            // attachments:[
            //     {
            //     filename : 'bottom_border@2x.png',
            //     path: baseUrl+'/assets/bottom_border@2x.png',
            //     cid : 'bottom_border@2x'
            //     },
            //     {
            //     filename : 'logo-color.png',
            //     path: baseUrl+'/assets/brigosha-logo@2x.png',
            //     cid : 'logo-color'
            //     }
            // ]

        };

        await this.mailerService.sendMail(mailOption)
        .then((success) => {
            console.log(success);
        })
        .catch((err) => {
            console.log(err);
        });
    }

}
