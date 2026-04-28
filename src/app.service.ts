import { Injectable } from '@nestjs/common';
import { SojebStorage } from './common/lib/Disk/SojebStorage';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello world';
  }
}
