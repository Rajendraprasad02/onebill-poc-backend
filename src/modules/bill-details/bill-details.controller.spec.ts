import { Test, TestingModule } from '@nestjs/testing';
import { BillDetailsController } from './bill-details.controller';
import { BillDetailsService } from './bill-details.service';

describe('BillDetailsController', () => {
  let controller: BillDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillDetailsController],
      providers: [BillDetailsService],
    }).compile();

    controller = module.get<BillDetailsController>(BillDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
