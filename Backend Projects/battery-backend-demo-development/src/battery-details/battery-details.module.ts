import { Module } from '@nestjs/common';
import { BatteryDetailsController } from './battery-details.controller';
import { BatteryDetailsService } from './battery-details.service';

@Module({
  controllers: [BatteryDetailsController],
  providers: [BatteryDetailsService]
})
export class BatteryDetailsModule {}
