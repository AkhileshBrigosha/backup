import { Module } from '@nestjs/common';
import { BatterySensorDataController } from './battery-sensor-data.controller';
import { BatterySensorDataService } from './battery-sensor-data.service';

@Module({
  controllers: [BatterySensorDataController],
  providers: [BatterySensorDataService]
})
export class BatterySensorDataModule {}
