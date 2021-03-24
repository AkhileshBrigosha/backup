import { InterviewSlots } from "src/entities/interview-slots.entity";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
const {google} = require('googleapis');
const calendar = google.calendar("v3");
import * as config from 'config';
import { InterviewSlotStatus } from '../recruitment/enum/recruitment.enum';
const fs = require('fs');
const readline = require('readline');
import { v4 as uuidv4 } from 'uuid';
let OAuth = null;
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<InterviewSlots> {

    constructor(){
        const SCOPES = ['https://www.googleapis.com/auth/calendar'];
       
        const TOKEN_PATH = 'config/token.json';

        fs.readFile('config/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), loginCheck);
        });

        function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
        }

        function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
            });
        });
        }

        function loginCheck(Oauth){
            if(Oauth){
                console.log('google login successful');  
                OAuth = Oauth;         
            }else{
                console.log('Login failed');             
            }
        }
    }

    listenTo() {
        return InterviewSlots;
    }

    async afterInsert(event: InsertEvent<InterviewSlots>) {
      
        let interviewSlot = await event.manager.getRepository(InterviewSlots).createQueryBuilder('interviewSlots')
                                                        .leftJoinAndSelect('interviewSlots.panelist', 'panelist')
                                                        .leftJoinAndSelect('interviewSlots.candidate', 'candidate')
                                                        .leftJoinAndSelect('candidate.jobs', 'job')
                                                        .leftJoinAndSelect('interviewSlots.schedule', 'schedule')
                                                        .where('interviewSlots.id = :id', {id: event.entity.id})
                                                        .getOne();
        if(event.entity.interviewStatus === InterviewSlotStatus.scheduled){
          const calendarEvent = await this.createCalendarEvent(interviewSlot);
          interviewSlot.googleCalenderId = calendarEvent['data']['id'];
          event.manager.save(interviewSlot)
        }
    }

    async afterUpdate(event: UpdateEvent<InterviewSlots>) {

      if(event.entity.interviewStatus === InterviewSlotStatus.cancelled){

        var params = {
          auth: OAuth,
          calendarId: 'primary',
          eventId: event.entity.googleCalenderId,
          };
    
          calendar.events.delete(params, function(err) {
            if (err) {
              console.log('The API returned an error: ' + err);
            return;
              }
            console.log('Event deleted.');
          });
      }
    }
    
    async createCalendarEvent(interviewSlot: InterviewSlots){
        const { frontendBaseUrl } = config.get('frontendserver');
        var event = {
            'summary': 'Interview with ' + interviewSlot.candidate.name + ' for ' + interviewSlot.candidate.jobs.title + ', Round ' + interviewSlot.round,
            'location': 'online',
            'start': {
              'dateTime': interviewSlot.date+'T'+interviewSlot.schedule.startTimeZone,
              'timeZone': 'Asia/Kolkata',
            },
            'end': {
              'dateTime': interviewSlot.date+'T'+interviewSlot.schedule.endTimeZone,
              'timeZone': 'Asia/Kolkata',
            },
            'recurrence': [
              
            ],
            'attendees': [
              {'email': interviewSlot.panelist.email},
              {'email': interviewSlot.candidate.email},
            ],
            'sendUpdates': 'all',
            'reminders': {
              'useDefault': false,
              'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
              ],
            },
            "conferenceData": {
                     "createRequest": {
                      "conferenceSolutionKey": {
                        "type": "hangoutsMeet"
                    },   
                      "requestId": uuidv4()
                     }
            }
        };
     
        return new Promise ((resolve, reject) => {
            calendar.events.insert({
              auth: OAuth,
              calendarId: 'primary',
              resource: event,
              conferenceDataVersion: 1
            }, function(err, event) {
              if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                resolve(null);
              }
              console.log('Event created: %s', JSON.stringify(event.data.id));
              resolve(event)
            });
        }
        )  
    }
}