import { Test, TestingModule } from '@nestjs/testing';
import { TrukController } from './truk.controller';
import { TrukService } from './truk.service';

describe('TrukController', () => {
  let controller: TrukController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrukController],
      providers: [TrukService],
    }).compile();

    controller = module.get<TrukController>(TrukController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
