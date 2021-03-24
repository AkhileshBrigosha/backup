import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BatteryDiagnosticDataService } from './battery-diagnostic-data.service';
import { BatteryDiagnosisDto } from './dto/battery-diagnostic.dto';

@Controller('diagnostic')
export class BatteryDiagnosticDataController {

    constructor(
        private batteryDiagnosticDataService: BatteryDiagnosticDataService,
    ){}

    @Post('create')
    saveBatteryPenalty(@Body() batteryDiagnosisDto: BatteryDiagnosisDto){
            return this.batteryDiagnosticDataService.saveBatteryDiagnosticData(batteryDiagnosisDto);  
    }

    @Get('/:bsn')
    getBatteryPenalty(@Param('bsn') bsn: string){
        return this.batteryDiagnosticDataService.getBatteryDiagnosticData(bsn);
    }
}
