import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BatteryPenaltyDataService } from './battery-penalty-data.service';
import { BatteryPenaltyDto } from './dto/battery-penalty.dto';

@Controller('penalty')
export class BatteryPenaltyDataController {

    constructor(
        private batteryPenaltyDataService: BatteryPenaltyDataService,
    ){}

    @Post('create')
    saveBatteryPenalty(@Body() batteryPenaltyDto: BatteryPenaltyDto){
            return this.batteryPenaltyDataService.saveBatteryPenalty(batteryPenaltyDto);  
    }

    @Get('/:bsn')
    getBatteryPenalty(@Param('bsn') bsn: string){
        return this.batteryPenaltyDataService.getBatteryPenalty(bsn);
    }
}
