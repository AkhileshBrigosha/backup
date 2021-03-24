import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUser } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { HackathonUser } from 'src/entities/hackathon-user.entity';
import { CreateTest } from './dto/create-test.dto';
import { HackathonTest } from 'src/entities/hackathon-tests.entity';
import { HackathonQuestions } from 'src/entities/hackathon-questions.entity';
import { CreateQuestions, QuestionType } from './dto/create-questions.dto';
import { SubmitQuestionsDto } from './dto/submit-questions.dto';
import { HackathonResult } from 'src/entities/hackathon-results.entity';
import { HackathonAnswers } from 'src/entities/hackathon-answers.entity';
import { AdminLogin } from './dto/admin-login.dto';
import { HackathonStatus, CandidateStatus } from './enum/hackathon.enum';
import { MailerService } from '@nestjs-modules/mailer';
import * as config from 'config';
import { EmailDto } from 'src/common/email/dto/email.dto';
import * as moment from 'moment';
import * as fs from 'fs-extra';
import { paginate } from 'nestjs-typeorm-paginate';
var parser = require('html-dom-parser');


@Injectable()
export class HackathonService {
  constructor(
    // @InjectRepository(HackathonUser)
    // private userRepo: Repository<HackathonUser>
    private readonly mailerService: MailerService
  ){}

  async getRegDetails(userId: number){
    const connection = getConnection('default');
    if(!userId){
      throw new BadRequestException("Please click on the link again!")
    }
    let user = await connection.getRepository(HackathonUser).findOne(userId);
    return {
      user,
      skills: ["Frontend", "Backend", "UI/UX Design", "AWS Server",
              "Embedded Systems", "IoT Firmware",
              "Algorithm Development", "AI"],
      programmingLangs: ["C", "C++", "Javascript", "NodeJs",
                        "Typescript", "PHP", "Python", "R",
                        "C#", "Swift", "Objective C", "Java",
                        "Kotlin"]
    }
  }

  async postRegister(createUser: CreateUser){
    try{
      const {
        name, phone, email, programmingLangs, skills
      } = createUser;
      let show = {};
      const connection = getConnection('default');

      let user = await connection.getRepository(HackathonUser).findOne({where: {phone}});

      if(!user){
        throw new InternalServerErrorException("Phone number not registered. Login from your registered phone or contact admin!")
      }
      user.name = name;
      user.email = email;
      user.programmingLangs = programmingLangs;
      user.skills = skills;

      user = await connection.manager.save(user);
      if(user){
        show = {
          type: 'success',
          message: "Successfully registered!"
        }
        return {show, user}
      }else{
        throw new InternalServerErrorException("Some error occured please try again!");
      }

    }catch(e){
      throw new InternalServerErrorException(e);
    }
  }


  async updateTest(createTest: CreateTest){
    const { id, title,  type, startTime, duration } = createTest;
    let test;
    const connection = getConnection();
    if(id){
      test = await connection.getRepository(HackathonTest).findOne(id);
      if(!test){
        throw new InternalServerErrorException("Test not found");
      }
    }else{
      test = new HackathonTest()
    }

    test.title = title;
    test.type = type;
    test.startTime = startTime;
    test.duration = duration;
    test.session = moment(startTime).format('MMM-YYYY')
    console.log(startTime, test.session);
    

    try{
      test = await connection.manager.save(test);
      if(test){
        const show = {
          type: 'success',
          message: 'Test saved successfully!'
        }
        return {show}
      }
      else {
        throw new InternalServerErrorException("Test could not be saved, please try again!");
      }

    }catch(e){
      throw new InternalServerErrorException(e);
    }


  }


  async addQuestions(createQuestions: CreateQuestions){
    const {testId, questions} = createQuestions;
    const connection = getConnection();
    const test = await connection.getRepository(HackathonTest).findOne(testId);
    try{
      let task, total = 0;
      for(const q of questions){
        if(q.id){
          task = await connection.getRepository(HackathonQuestions).findOne(q.id);
        }else{
          task = new HackathonQuestions();
        }
        task.question = q.question;
        task.type = q.type;
        task.positive = q.positive;
        task.negative = q.negative;
        task.options = q.options;
        task.answer = q.answer;
        task.test= testId;

        task = await connection.manager.save(task);
        total = total + task.positive;


        test.totalPoints = total;
        await connection.manager.save(test);
      }
      const show = {
        type: "success",
        message: "Questions Added Successfully!"
      }
      return {show}

    }catch(e){
      throw new InternalServerErrorException(e);
    }

  }


  async updateQuestion(questionType: QuestionType){
    const { id, question, type, positive, negative, options, answer } =  questionType;
    const connection = getConnection();
    const task = await connection.getRepository(HackathonQuestions).findOne(id);
    if(!task){
      throw new InternalServerErrorException("Question Not Found");
    }
    task.question = question;
    task.type = type;
    task.positive = positive;
    task.negative = negative;
    task.options = options;
    task.answer = answer.toString();
    try{
      await connection.manager.save(task);
      const show = {
        type: "success",
        message: "Question Updated Successfully!"
      }
      return {show}
    }catch(e){
      throw new InternalServerErrorException(e);
    }
  }


  async getTest(role: string){
    const connection = getConnection();
    if(role === 'Admin'){
      return await connection.getRepository(HackathonTest).find({where: {status: HackathonStatus.active}});
    }else{
      throw new UnauthorizedException();
    }
  }


  async getTestById(id: number, userId: number, role: string){
    const connection = getConnection();
    const test = await connection.getRepository(HackathonTest).findOne(id, {relations: ["questions"]});
    if(role === "Candidate"){
      const startTime = moment(test.startTime);
      const endTime = moment(startTime).add(test.duration,'m');
      const currentTime = moment();
      const session = moment().format("MMM-YYYY");
      console.log("session", session);
      
      const userResult = await connection.getRepository(HackathonResult).createQueryBuilder('res')
      .innerJoinAndSelect('res.candidate','candidate', 'candidate.id = :userId', {userId})
      .innerJoinAndSelect('res.test','test', 'test.type = :type AND test.session = :session', {type: test.type, session }).getOne();
      console.log("userResult", userResult);
      
      if(userResult){
          // const show = {
          //   type: 'error',
          //   message: 'You have already attempted the test!'
          // }
          return {attempted: true, result: userResult, qCount: test.questions.length}
      }
      

      if(currentTime < startTime){
        const show = {
          type: 'error',
          message: 'Test not started yet!'
        }
        return {show}
      }
      if(currentTime > endTime){
        const show = {
          type: 'error',
          message: 'This test has already completed!'
        }
        return {show}
      }
     

        const list = test.questions.map(item => {
          delete item.answer;
          return item
        }
        )
        test.questions = list;
        return test;
    }else if(role === "Admin"){
      return test;
    }else{
      throw new UnauthorizedException();
    }


  }


  async submitTest(submitDto: SubmitQuestionsDto){
    const {candidateId, testId, answers} = submitDto;
    const connection = getConnection();
    let show = {}
    try{
      const user = await connection.getRepository(HackathonUser).findOne(candidateId);
      if(!user){
        show = {
          type: 'error',
          message: 'User not regiistered! Please contact admin.'
        }
        return {show}
      }

      const test = await connection.getRepository(HackathonTest).findOne(testId, {relations: ['questions']});
      if(!test){
        show = {
          type: 'error',
          message: 'Test not found!'
        }
        return {show}
      }

      const session = moment().format("MMM-YYYY");
      let userResult = await connection.getRepository(HackathonResult).createQueryBuilder('res')
      .innerJoinAndSelect('res.candidate','candidate', 'candidate.id = :candidateId', {candidateId})
      .innerJoinAndSelect('res.test','test', 'test.type = :type AND test.session = :session', {type: test.type, session }).getOne();
      if(userResult){
        // show = {
        //   type: 'error',
        //   message: 'You have already attempted the test!'
        // }
        return {attempted: true, result: userResult, qCount: test.questions.length}
      }
      let totalMarks = 0, correct = 0, wrong = 0, attempted = 0;
      for(const ans of answers){

        const {questionId, answer} = ans;
        if(answer){
          attempted++;
          const question = await connection.getRepository(HackathonQuestions).findOne(questionId);
          const newAns = new HackathonAnswers();
          newAns.question = question;
          newAns.answer = answer.toString();
          // newAns.correct = question.answer === answer;
          if(question.answer === answer){
            newAns.correct = true;
            correct++;
            totalMarks = totalMarks + question.positive;

          }else{
            newAns.correct = false;
            wrong++;
            totalMarks = totalMarks - question.negative;
          }
         await connection.manager.save(newAns);
        }
      }
      userResult = new HackathonResult();
      userResult.candidate = user;
      userResult.test = test;
      userResult.totalMarks = totalMarks;
      userResult.correct = correct;
      userResult.wrong = wrong;
      userResult.attempted = attempted;
      await connection.manager.save(userResult)

      show = {
        type: 'success',
        message: 'Test Submitted Successfully!'
      }
      const result = {totalMarks, attempted, correct, wrong}
      return {show, result, qCount: test.questions.length}
    }catch(e){
      throw new InternalServerErrorException(e);
    }

  }


  adminLogin(adminLoginDto: AdminLogin){
    const {email, password} = adminLoginDto;
    let show;
    if(email === 'admin@brigosha.com' && password === '1234'){
      show = {
        type: 'success',
        message: 'Logged in successfully!'
      }
      return {show}
    }else{
      throw new UnauthorizedException('Invalid Credentials');
    }
  }


  async getUsers(role: string, page: number){
    const connection = getConnection();
    try{
      // const users = await connection.getRepository(HackathonUser).find({relations: ['testResult', 'testResult.test', 'testResult.test.questions']});
      const usersQuery = connection.getRepository(HackathonUser).createQueryBuilder('users')
                                .leftJoinAndSelect('users.testResult','testResult')
                                .leftJoinAndSelect('testResult.test', 'test')
                                .leftJoinAndSelect('test.questions','questions');
      const users = await paginate<HackathonUser>(usersQuery, {
        page,
        limit: 20,
      });
      const response = users.items.map(item => {
        if(item.testResult){
          Object.assign(item.testResult, {qCount: item.testResult.test.questions.length});
          delete item.testResult.test;
        }
        return item;
      })
      return {users: users.items, pageMeta: users.meta}
    }catch(e){
      throw new InternalServerErrorException(e);
    }

  }

  async updateStatus(id: number, status: CandidateStatus){
    const connection = getConnection();
    try{
      const user = await connection.getRepository(HackathonUser).findOne(id);
      user.status = status;
      await connection.manager.save(user);
      const show = {
        type: 'success',
        message: "Updated Successfully"
      }
      return {show}
    }catch(e){
      throw new InternalServerErrorException(e);
    }

  }


  async sendLink(emails: string[]){
    const connection = getConnection();
    try{
      for(const email of emails){
        const user = await connection.getRepository(HackathonUser).findOne({where: {email}});
        const session = moment().format("MMM-YYYY");
        const tests = await connection.getRepository(HackathonTest).find({where: {session, status: HackathonStatus.active}});
        const noOfTests = tests.length;
        const testId = Math.floor((Math.random() * noOfTests));        
        if(!tests || !tests.length){
          throw new InternalServerErrorException("No tests created. Please create a test first!")
        }
        const test = tests[testId];
        const time = moment(test.startTime).format('dddd, DD MMM YYYY, hh:mm A');
        await this.sendMail(user, test.id, time)

      }
      const show = {
        type: 'success',
        message: "Mail(s) Sent Successfully"
      }
      return {show}
    }catch(e){
      throw new InternalServerErrorException(e);
    }


  }


  async deleteTest(id: number){
    try{
      const connection = getConnection();
      const test = await connection.getRepository(HackathonTest).findOne(id);
      if(!test){
        throw new InternalServerErrorException("Test not found");
      }
      test.status = HackathonStatus.inactive;
      await connection.manager.save(test);
    }catch(e){
      throw new InternalServerErrorException(e);
    }
  }

  async deleteQuestion(id: number){
    try{
      const connection = getConnection();
      const quest = await connection.getRepository(HackathonQuestions).findOne(id);
      if(!quest){
        throw new InternalServerErrorException("Question not found");
      }
      parser(quest.question).map(img => img.children.map(imgSrc => {
        if(imgSrc.type === 'img'){
          const filename = imgSrc.attribs.src;
          fs.unlink(filename, function (err) {
                    if(err){
                        return console.error(err);
                    }
                })
        }
      }));
      await connection.manager.remove(quest);
      const show = {
        type: 'success',
        message: "Question Deleted!"
      }
      return {show}
    }catch(e){
      throw new InternalServerErrorException(e);
    }
  }


  async sendMail(user: HackathonUser, id: number, time: string){
      const { frontendBaseUrl } = config.get('hackathonServer');
      const { baseUrl } = config.get('backendserver');
      const request: EmailDto = {
          to: user.email,
          // cc: 'kooljit.das@brigosha.com',
          subject: 'Brigosha Hiring Hackathon | 2020',
          template: 'hackathon-invite',
          context: {
          link: frontendBaseUrl+'/?userId='+user.id+'&testId='+id,
          date: time,
          username: user.name,
          phone: user.phone
          },
          attachments:[
              {
              filename : 'bottom_border@2x.png',
              path: baseUrl+'/api/assets/bottom_border@2x.png',
              cid : 'bottom_border@2x'
              },
              {
              filename : 'brigosha-logo@2x.png',
              path: baseUrl+'/api/assets/brigosha-logo@2x.png',
              cid : 'brigosha-logo@2x'
              }
          ]

      }

      await this.mailerService.sendMail(request)
      .then((success) => {
          console.log(success);
      })
      .catch((err) => {
          console.log(err)
      });
  }
}
