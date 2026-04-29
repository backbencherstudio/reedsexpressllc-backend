import { Module } from '@nestjs/common';
import { TrukService } from './truk.service';
import { TrukController } from './truk.controller';

@Module({
  controllers: [TrukController],
  providers: [TrukService],
})
export class TrukModule {}
