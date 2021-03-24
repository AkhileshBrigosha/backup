import { Module } from '@nestjs/common';
import { BatteryDiagnosticDataController } from './battery-diagnostic-data.controller';
import { BatteryDiagnosticDataService } from './battery-diagnostic-data.service';

@Module({
  controllers: [BatteryDiagnosticDataController],
  providers: [BatteryDiagnosticDataService]
})
export class BatteryDiagnosticDataModule {}
