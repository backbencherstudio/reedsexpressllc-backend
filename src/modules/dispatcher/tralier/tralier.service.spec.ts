import { Test, TestingModule } from '@nestjs/testing';
import { TralierService } from './tralier.service';

describe('TralierService', () => {
  let service: TralierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TralierService],
    }).compile();

    service = module.get<TralierService>(TralierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
