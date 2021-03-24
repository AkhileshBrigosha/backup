import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatteryStatus } from 'src/entities/battery-status.entity';
import { getConnection, getManager } from 'typeorm';
import { BatteryStatusDto } from './dto/battery-status.dto';


@Injectable()
export class BatteryStatusService {
    constructor(
       // private jobPostingService: JobPostingService
    ){}

    async cancelInterviewSlots(schedules: any){
        const batteryConnection = getConnection('default');
        const queryRunner = batteryConnection.createQueryRunner();
        await queryRunner.connect();  

        const candidateSlots = await batteryConnection.getRepository(BatteryStatus).createQueryBuilder('slots')
                                                        
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


    async getBatteryStatus(bsn: string): Promise<object>{
        const batteryConnection = getConnection('default');
        const manager = getManager(); 
        let res;
        try{
             res = await manager.findOne(BatteryStatus, { bsn:bsn });
        }catch(e){
           // await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
          //  await queryRunner.release();
        }
        
        return res;
    }


    async saveBatteryStatusData(batteryStatusDto:BatteryStatusDto): Promise<object> {
        const {SOC,TTE,macId,bsn,timeStamp,batteryState,cycleCount,ahin,ahout,TotalPenalty} = batteryStatusDto;
    
        const pocConnection = getConnection('default');
            try{
                    const data = new BatteryStatus();
                    data.SOC=SOC
                    data.bsn=bsn
                    data.macId=macId
                    data.timeStamp=timeStamp
                    data.batteryState=batteryState
                    data.cycleCount=cycleCount
                    data.ahin=ahin
                    data.ahout=ahout
                    data.TotalPenalty=TotalPenalty
                    data.createdAt=new Date()
                    await pocConnection.manager.save(data);
                
            }catch(e){
                throw new InternalServerErrorException(e);
            }
        
        return {show:{type:'success',message:'Data saved successfully'}}
    }
}