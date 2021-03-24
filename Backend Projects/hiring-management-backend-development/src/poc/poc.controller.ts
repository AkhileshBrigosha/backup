import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PocService } from './poc.service';
import { SensorDataDto } from './dto/sensor-data.dto';
import { VectorsDataDto } from './dto/vectors-data.dto';

@Controller('poc')
export class PocController {
    constructor(
        private pocService: PocService
    ){}

    @Get('sensordata')
    getSensorData(){
        return this.pocService.getSensorData();
    }

    @Get('vectorsdata')
    getVectorsData(){
        return this.pocService.getVectorsData();
    }

    @Post('sensordata')
    postSensorData(
        @Body() sensorDataDto: SensorDataDto
    ){
        return this.pocService.postSensorData(sensorDataDto);
    }

    @Post('vectors')
    postVectorsData(
        @Body() vectorsDataDto: VectorsDataDto
    ){
        return this.pocService.postVectorsData(null, vectorsDataDto);
    }

    @Patch('vectors/:id')
    patchVectorsData(
        @Param('id') id: number,
        @Body() vectorsDataDto: VectorsDataDto
    ){
        return this.pocService.postVectorsData(id, vectorsDataDto);
    }
}
