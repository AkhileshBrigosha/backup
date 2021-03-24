import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BatteryDetailsService } from './battery-details.service';
import { BatteryDetailsDto } from './dto/battery-details.dto';

@Controller('details')
export class BatteryDetailsController {

    constructor(
        private batteryDetailsService: BatteryDetailsService,
    ){}

    @Post('create')
    saveBatteryPenalty(@Body() batteryDetailsDto: BatteryDetailsDto){
            return this.batteryDetailsService.saveBatteryDetailsData(batteryDetailsDto);  
    }

    @Get('/:bsn')
    getBatteryPenalty(@Param('bsn') bsn: string){
        return this.batteryDetailsService.getBatteryDetails(bsn);
    }

    @Put('/:bsn/:lat/:lng')
    updateBatteryLocation(@Param('bsn') bsn: string,@Param('lat') lat: number,@Param('lng') lng: number){
        return this.batteryDetailsService.updateBatteryLocation(bsn,lat,lng);
    }
}
