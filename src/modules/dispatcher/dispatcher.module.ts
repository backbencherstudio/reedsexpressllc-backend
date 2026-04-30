import { Module } from '@nestjs/common';
import { CarrierModule } from './carrier/carrier.module';
import { TruckModule } from './truck/truck.module';

@Module({
  imports: [CarrierModule, TruckModule],
  controllers: [],
  providers: [],
})
export class DispatcherModule {}
