import { Controller, Get, Post, Body, Param, Patch, Query, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { CreateUser } from './dto/create-user.dto';
import { CreateTest } from './dto/create-test.dto';
import { CreateQuestions, QuestionType } from './dto/create-questions.dto';
import { SubmitQuestionsDto } from './dto/submit-questions.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/common/image-upload/image-upload.utils';
import * as fs from 'fs-extra';
import { AdminLogin } from './dto/admin-login.dto';
import { CandidateStatus } from './enum/hackathon.enum';
var config = require('config');
const url = config.get('backendserver');

@Controller('hackathon')
export class HackathonController {
  constructor(
    private hackathonService: HackathonService
  ){}

  @Get('register/:userId')
  getRegistration(@Param('userId') userId: number){
    return this.hackathonService.getRegDetails(userId)
  }

  @Post('register')
  register(@Body() createUser: CreateUser){
    return this.hackathonService.postRegister(createUser)
  }

  @Post('test')
  updateTest(@Body() createTest: CreateTest){
    return this.hackathonService.updateTest(createTest)
  }


  @Post('questions')
  addQuestions(@Body() createQuestions: CreateQuestions){
    return this.hackathonService.addQuestions(createQuestions)
  }

  @Post('admin-login')
  adminLogin(@Body() adminLoginDto: AdminLogin){
    return this.hackathonService.adminLogin(adminLoginDto)
  }

  @Post('upload-image')
  @UseInterceptors(
        FileInterceptor('upload', {
          storage: diskStorage({
            destination: './public/api/uploads/hackathon-questions',
            filename: editFileName,
          }),
          fileFilter: imageFileFilter,
        }),
    )
  uploadImage(@UploadedFile() upload: any){
    let image = null;
            if(upload){
                image = upload.filename;
            }
            // if(image){
            //       fs.move('src/../public/temp/' + image, 'src/../public/api/uploads/hackathon-questions/' + image, function (err) {
            //           if (err) {
            //               return console.error(err);
            //           }
            //       });
            //   }
            return {
              url: image ? url.baseUrl + '/api/uploads/hackathon-questions/' + image : null
            };
  }

  @Patch('question')
  updateQuestion(@Body() questionType: QuestionType){
    return this.hackathonService.updateQuestion(questionType)
  }


  @Patch('user-status/:id')
  updateStatus(
    @Param('id') id: number,
    @Query('status') status: CandidateStatus
  ){
    return this.hackathonService.updateStatus(id, status)
  }


  @Post('send-mail')
  sendLink(
    @Body('emails') emails: string[]
  ){
    return this.hackathonService.sendLink(emails)
  }

  @Get('test')
  getTests(
    @Query('role') role: string
  ){
    return this.hackathonService.getTest(role)
  }

  @Get('user')
  getUser(
    @Query('role') role: string,
    @Query('page') page: number
  ){
    return this.hackathonService.getUsers(role, page)
  }

  @Get('test/:id')
  getTestById(
    @Param('id') id: number,
    @Query('userId') userId: number,
    @Query('role') role: string
  ){
    return this.hackathonService.getTestById(id, userId, role)
  }

  @Post('submit-test')
  submitTest(@Body() submitDto: SubmitQuestionsDto){
    return this.hackathonService.submitTest(submitDto)
  }

  @Delete('test/:id')
  deleteTest(@Param('id') id: number){
    return this.hackathonService.deleteTest(id)
  }

  @Delete('question/:id')
  deleteQuestion(@Param('id') id: number){
    return this.hackathonService.deleteQuestion(id)
  }

  @Delete('delete-image')
    async deleteImages(
        @Query('deletedFiles') deletedFiles : string[],
    ){

        const params = {
            url
        };

        if(deletedFiles){
            deletedFiles.forEach((keyFilename)=>{
                fs.unlink('src/../public/api/uploads/hackathon-questions/'+keyFilename, function (err) {
                    if(err){
                        return console.error(err);
                    }
                })
            });
        }

        return true;
    }

}
