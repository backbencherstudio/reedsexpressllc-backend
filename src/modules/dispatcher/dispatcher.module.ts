import { Module } from '@nestjs/common';
import { CarrierModule } from './carrier/carrier.module';
import { TruckModule } from './truck/truck.module';
import { TralierModule } from './tralier/tralier.module';

@Module({
  imports: [CarrierModule, TruckModule, TralierModule],
  controllers: [],
  providers: [],
})
export class DispatcherModule {}
