import { Test, TestingModule } from '@nestjs/testing';
import { TralierController } from './tralier.controller';
import { TralierService } from './tralier.service';

describe('TralierController', () => {
  let controller: TralierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TralierController],
      providers: [TralierService],
    }).compile();

    controller = module.get<TralierController>(TralierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
