import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { BatteryStatusService } from './battery-status.service';
import { BatteryStatusDto } from './dto/battery-status.dto';


@Controller('status')
export class BatteryStatusController {
    constructor(
        private batteryStatusService: BatteryStatusService,
    ){}

    @Post('create')
    saveBatteryStatus(@Body() batteryStatusDto: BatteryStatusDto){
            return this.batteryStatusService.saveBatteryStatusData(batteryStatusDto);  
    }

    @Get('/:bsn')
    getBatteryStatus(@Param('bsn') bsn: string){
        return this.batteryStatusService.getBatteryStatus(bsn);
    }
}
