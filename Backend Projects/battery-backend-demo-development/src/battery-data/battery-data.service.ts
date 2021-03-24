import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatteryData } from 'src/entities/battery-data.entity';
import { getConnection, getManager } from 'typeorm';
import { BatteryDataDto } from './dto/battery-data.dto';

@Injectable()
export class BatteryDataService {

    
    constructor(
        // private jobPostingService: JobPostingService
     ){}
 
     async cancelInterviewSlots(schedules: any){
         const batteryConnection = getConnection('default');
         const queryRunner = batteryConnection.createQueryRunner();
         await queryRunner.connect();  
 
         const candidateSlots = await batteryConnection.getRepository(BatteryData).createQueryBuilder('slots')
                                                         
                                                         .getMany();
         const interviewSlots = candidateSlots;
         await queryRunner.startTransaction();
         try{
             for(const candidateSlot of candidateSlots){
                 
                 // candidateSlot.interviewStatus = InterviewSlotStatus.cancelled;
 
                 // const candidate = await queryRunner.manager.findOne(Candidates, {
                 //     where: {id: candidateSlot.candidate.id}
                 // })
 
                 // candidate.candidateStatus = candidateSlot.candidate.currentRound == 1 ? CandidateStatus.shortlisted : CandidateStatus.inprogress;
                 // candidate.currentRound = candidateSlot.candidate.currentRound > 0 ? candidateSlot.candidate.currentRound - 1 : candidateSlot.candidate.currentRound;
 
                 // await queryRunner.manager.save(candidateSlot);
                 // await queryRunner.manager.save(candidate);
                 // await queryRunner.commitTransaction();
             }
         }catch(e){
             await queryRunner.rollbackTransaction();
             throw new InternalServerErrorException(e);
         }finally{
             await queryRunner.release();
         }
         
         return interviewSlots;
     }
 
 
     async getBatteryData(bsn: string): Promise<object>{
         const batteryConnection = getConnection('default');
         const manager = getManager(); 
         let res;
         try{
              res = await manager.findOne(BatteryData, { bsn:bsn });
         }catch(e){
            // await queryRunner.rollbackTransaction();
             throw new InternalServerErrorException(e);
         }finally{
           //  await queryRunner.release();
         }
         
         return res;
     }
 
 
     async saveBatteryData(batteryDataDto:BatteryDataDto): Promise<object> {
         const {macId,bsn,timeStamp,cycleCount,ahin,ahout,temperature,voltage,current,idle1Penalty,bulbCapacitance,electrolyteLevel,mode
        ,idle2Penalty,specificGravity,lastSucBleConnTS,lastSucWiFiConnTS,levelCapacitance,refreshRechargeIndexTS,iniRechargeIndexTS} = batteryDataDto;
     
         const pocConnection = getConnection('default');
             try{
                     const data = new BatteryData();
                     data.mode=mode
                     data.bsn=bsn
                     data.macId=macId
                     data.timeStamp=timeStamp
                     data.temperature=temperature
                     data.cycleCount=cycleCount
                     data.current=current
                     data.ahin=ahin
                     data.voltage=voltage
                     data.specificGravity=specificGravity
                     data.ahout=ahout
                     data.idle1Penalty=idle1Penalty
                     data.idle2Penalty=idle2Penalty
                     data.lastSucWiFiConnTS=lastSucWiFiConnTS
                     data.lastSucBleConnTS=lastSucBleConnTS
                     data.bulbCapacitance=bulbCapacitance
                     data.electrolyteLevel=electrolyteLevel
                     data.levelCapacitance=levelCapacitance
                     data.refreshRechargeIndexTS=refreshRechargeIndexTS
                     data.iniRechargeIndexTS=iniRechargeIndexTS
                     data.createdAt=new Date()
                     await pocConnection.manager.save(data);
                 
             }catch(e){
                 throw new InternalServerErrorException(e);
             }
         
         return {show:{type:'success',message:'Battery Data saved successfully'}}
     }
}
