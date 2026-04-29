import { Test, TestingModule } from '@nestjs/testing';
import { TrukService } from './truk.service';

describe('TrukService', () => {
  let service: TrukService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrukService],
    }).compile();

    service = module.get<TrukService>(TrukService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
