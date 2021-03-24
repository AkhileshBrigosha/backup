import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatteryDetails } from 'src/entities/battery-details.entity';
import { getConnection, getManager } from 'typeorm';
import { BatteryDetailsDto } from './dto/battery-details.dto';

@Injectable()
export class BatteryDetailsService {


    async getBatteryDetails(bsn: string): Promise<object>{
        const batteryConnection = getConnection('default');
        const manager = getManager(); 
        let res;
        try{
             res = await manager.findOne(BatteryDetails, { bsn:bsn });
        }catch(e){
           // await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e);
        }finally{
          //  await queryRunner.release();
        }
        
        return res;
    }


    async saveBatteryDetailsData(batteryDetailsDto:BatteryDetailsDto): Promise<object> {
        const {macId,bsn,lat,lng,batteryInfo,wifiSSID,wifiPassword,mode,BLEId,firmwareId,firmwareVer,hardwareVer,validTill,isActive} = batteryDetailsDto;
        const pocConnection = getConnection('default');
            try{
                    const data = new BatteryDetails();
                    data.bsn=bsn
                    data.macId=macId
                    data.mode=mode
                    data.lat=lat
                    data.lng=lng
                    data.batteryInfo=batteryInfo
                    data.wifiSSID=wifiSSID
                    data.WifiPassword=wifiPassword
                    data.BLEId=BLEId
                    data.firmwareId=firmwareId
                    data.firmwareVer=firmwareVer
                    data.hardwareVer=hardwareVer
                    data.validTill=validTill
                    data.isActive=isActive
                    data.createdAt=new Date()
                    await pocConnection.manager.save(data);
                
            }catch(e){
                throw new InternalServerErrorException(e);
            }
        
        return {show:{type:'success',message:'Batery Details Data saved successfully'}}
    }

    async updateBatteryLocation(bsn:string,lat:number,lng:number): Promise<object> {
        const pocConnection = getConnection('default');
        const manager = getManager(); 
        let battery;
            try{
                battery = await manager.findOne(BatteryDetails, { bsn:bsn });
                battery.lat=lat
                battery.lng=lng
                await pocConnection.manager.save(battery);

            }catch(e){
                throw new InternalServerErrorException(e);
            }
            return battery;
}
}