import { Module } from '@nestjs/common';
import { TralierService } from './tralier.service';
import { TralierController } from './tralier.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TralierController],
  providers: [TralierService],
})
export class TralierModule {}
