import { Module } from '@nestjs/common';
import { CarrierModule } from './carrier/carrier.module';
import { TruckModule } from './truck/truck.module';
import { TralierModule } from './tralier/tralier.module';
import { DriverModule } from './driver/driver.module';

@Module({
  imports: [CarrierModule, TruckModule, TralierModule, DriverModule],
  controllers: [],
  providers: [],
})
export class DispatcherModule {}
