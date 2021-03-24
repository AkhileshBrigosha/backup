import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BatteryDataService } from './battery-data.service';
import { BatteryDataDto } from './dto/battery-data.dto';

@Controller('data')
export class BatteryDataController {

    constructor(
        private batteryDataService: BatteryDataService,
    ){}

    @Post('create')
    saveBatteryStatus(@Body() batteryDataDto: BatteryDataDto){
            return this.batteryDataService.saveBatteryData(batteryDataDto);  
    }

    @Get('/:bsn')
    getBatteryStatus(@Param('bsn') bsn: string){
        return this.batteryDataService.getBatteryData(bsn);
    }
}
