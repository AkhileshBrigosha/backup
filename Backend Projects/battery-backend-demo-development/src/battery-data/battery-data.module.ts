import { Module } from '@nestjs/common';
import { BatteryDataController } from './battery-data.controller';
import { BatteryDataService } from './battery-data.service';

@Module({
  controllers: [BatteryDataController],
  providers: [BatteryDataService]
})
export class BatteryDataModule {}
