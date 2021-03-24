import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BatterySensorDataService } from './battery-sensor-data.service';
import { BatterySensorDto } from './dto/battery-sensor.dto';

@Controller('sensor')
export class BatterySensorDataController {
    constructor(
        private batterySensorDataService: BatterySensorDataService,
    ){}

    @Post('create')
    saveBatterySensor(@Body() batterySensorDto: BatterySensorDto){
            return this.batterySensorDataService.saveBatteryStatusData(batterySensorDto);  
    }

    @Get('/:bsn')
    getBatterySensor(@Param('bsn') bsn: string){
        return this.batterySensorDataService.getBatteryStatus(bsn);
    }
}
