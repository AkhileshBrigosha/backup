import { Module } from '@nestjs/common';
import { BatteryStatusController } from './battery-status.controller';
import { BatteryStatusService } from './battery-status.service';

@Module({
  controllers: [BatteryStatusController],
  providers: [BatteryStatusService]
})
export class BatteryStatusModule {}
