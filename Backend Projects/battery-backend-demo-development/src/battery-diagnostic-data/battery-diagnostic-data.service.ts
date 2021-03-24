import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatteryDiagnosis } from 'src/entities/battery-diagnostic.entity';
import { getConnection, getManager } from 'typeorm';

@Injectable()
export class BatteryDiagnosticDataService {

    async getBatteryDiagnosticData(bsn: string): Promise<object>{
        const batteryConnection = getConnection('default');
        const manager = getManager(); 
        let res;
        try{
             res = await manager.findOne(BatteryDiagnosis, { bsn:bsn });
        }catch(e){
           // await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
          //  await queryRunner.release();
        }
        
        return res;
    }


    async saveBatteryDiagnosticData(batteryDiagnosis:any): Promise<object> {
        const {macId,bsn,timeStamp,mode,noOfDiagnosis,payload} = batteryDiagnosis;
    
        const pocConnection = getConnection('default');
            try{
                    const data = new BatteryDiagnosis();
                    data.bsn=bsn
                    data.macId=macId
                    data.mode=mode
                    data.timeStamp=timeStamp
                    data.noOfDiagnosis=noOfDiagnosis
                    data.payload=payload
                   
                    data.createdAt=new Date()
                    await pocConnection.manager.save(data);
                
            }catch(e){
                throw new InternalServerErrorException(e);
            }
        
        return {show:{type:'success',message:'Diagnostic Data saved successfully'}}
    }
}
