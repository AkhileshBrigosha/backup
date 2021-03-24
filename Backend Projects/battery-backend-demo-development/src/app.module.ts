import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BatteryStatusModule } from './battery-status/battery-status.module';
import { BatterySensorDataModule } from './battery-sensor-data/battery-sensor-data.module';
import { BatteryPenaltyDataModule } from './battery-penalty-data/battery-penalty-data.module';
import { UserModule } from './user/user.module';
import { BatteryDiagnosticDataModule } from './battery-diagnostic-data/battery-diagnostic-data.module';
import { BatteryDetailsModule } from './battery-details/battery-details.module';
import { BatteryDataModule } from './battery-data/battery-data.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    BatteryStatusModule,
    BatterySensorDataModule,
    BatteryPenaltyDataModule,
    UserModule,
    LoginModule,
    BatteryDiagnosticDataModule,
    BatteryDetailsModule,
    BatteryDataModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
