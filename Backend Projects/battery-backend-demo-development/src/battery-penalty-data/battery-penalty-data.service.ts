import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatteryPenalty } from 'src/entities/battery-penalty.entity';
import { getConnection, getManager } from 'typeorm';

@Injectable()
export class BatteryPenaltyDataService {


    async getBatteryPenalty(bsn: string): Promise<object>{
        const batteryConnection = getConnection('default');
        const manager = getManager(); 
        let res;
        try{
             res = await manager.findOne(BatteryPenalty, { bsn:bsn });
        }catch(e){
           // await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
          //  await queryRunner.release();
        }
        
        return res;
    }


    async saveBatteryPenalty(batteryPenalty:any): Promise<object> {
        const {macId,bsn,timeStamp,noOfPenalty,payload,mode} = batteryPenalty;
    
        const pocConnection = getConnection('default');
            try{
                    const data = new BatteryPenalty();
                    data.bsn=bsn
                    data.macId=macId
                    data.mode=mode
                    data.timeStamp=timeStamp
                    data.noOfPenalty=noOfPenalty
                    data.payload=payload
            
                    data.createdAt=new Date()
                    await pocConnection.manager.save(data);
                
            }catch(e){
                throw new InternalServerErrorException(e);
            }
        
        return {show:{type:'success',message:'Penalty Data saved successfully'}}
    }
}
