import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatterySensor } from 'src/entities/battery-sensor.entity';
import { getConnection, getManager } from 'typeorm';
import { BatterySensorDto } from './dto/battery-sensor.dto';

@Injectable()
export class BatterySensorDataService {

    async getBatteryStatus(bsn: string): Promise<object>{
        const batteryConnection = getConnection('default');
        const manager = getManager(); 
        let res;
        try{
             res = await manager.findOne(BatterySensor, { bsn:bsn });
        }catch(e){
           // await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
          //  await queryRunner.release();
        }
        
        return res;
    }


    async saveBatteryStatusData(batterySensorDto:BatterySensorDto): Promise<object> {
        const {macId,bsn,timeStamp,electrolyteLevel,volatage,current,levelCapacitance,mode,temperature,specificGravity} = batterySensorDto;
    
        const pocConnection = getConnection('default');
            try{
                    const data = new BatterySensor();
                    data.bsn=bsn
                    data.macId=macId
                    data.mode=mode
                    data.timeStamp=timeStamp
                    data.volatage=volatage
                    data.current=current
                    data.temperature=temperature
                    data.specificGravity=specificGravity
                    data.electrolyteLevel=electrolyteLevel
                    data.levelCapacitance=levelCapacitance
                    data.createdAt=new Date()
                    await pocConnection.manager.save(data);
                
            }catch(e){
                throw new InternalServerErrorException(e);
            }
        
        return {show:{type:'success',message:'Sensor Data saved successfully'}}
    }
}
