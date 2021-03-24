import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Vectors } from 'src/entities/vectors.entity';
import { getConnection } from 'typeorm';
import { Sensor } from '../entities/sensor-data.entity';
import { SensorDataDto } from './dto/sensor-data.dto';
import { VectorsDataDto } from './dto/vectors-data.dto';

@Injectable()
export class PocService {
    async getSensorData(): Promise<object>{
        const pocConnection = getConnection('default');
        const sensorData = await pocConnection.manager.find(Sensor);

        return sensorData;
    }

    async postSensorData(sensorDataDto: SensorDataDto): Promise<object> {
        const {sensorDatas} = sensorDataDto;
        const pocConnection = getConnection('default');

        if(sensorDatas && sensorDatas.length > 0){
            try{
                for(const sensorData of sensorDatas){
                    const data = new Sensor()

                    data.name = sensorData.name;
                    data.accelerometer = sensorData.accelerometer;
                    data.magnetometer = sensorData.magnetometer;
                    data.gyroscope = sensorData.gyroscope;
                    data.barometer = sensorData.barometer;

                    await pocConnection.manager.save(data);
                }
            }catch(e){
                throw new InternalServerErrorException(e);
            }
        }
        return {show:{type:'success',message:'Data saved successfully'}}
    }
    
    async getVectorsData(): Promise<object>{
        const pocConnection = getConnection('default');
        const sensorData = await pocConnection.manager.find(Vectors);

        return sensorData;
    }

    async postVectorsData(id: number, vectorsDataDto: VectorsDataDto): Promise<object> {
        
        const {studentName, course, school, address, phone, email, preferredExamDate} = vectorsDataDto;
        
        const pocConnection = getConnection('default');

        let vectorsData = await pocConnection.manager.findOne(Vectors, {id});

        if(!vectorsData){
            vectorsData = new Vectors;
        }

        vectorsData.name = studentName;
        vectorsData.course = course;
        vectorsData.school = school;
        vectorsData.address = address;
        vectorsData.phone = phone;
        vectorsData.email = email;
        vectorsData.preferredExamDate = preferredExamDate;
        try{
            await pocConnection.manager.save(vectorsData);
        }catch(e){
            throw new InternalServerErrorException(e);
        }
        
        return {show:{type:'success',message:'Data saved successfully'}}
    }
}
