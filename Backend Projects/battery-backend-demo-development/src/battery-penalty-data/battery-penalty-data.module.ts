import { Module } from '@nestjs/common';
import { BatteryPenaltyDataController } from './battery-penalty-data.controller';
import { BatteryPenaltyDataService } from './battery-penalty-data.service';

@Module({
  controllers: [BatteryPenaltyDataController],
  providers: [BatteryPenaltyDataService]
})
export class BatteryPenaltyDataModule {}
