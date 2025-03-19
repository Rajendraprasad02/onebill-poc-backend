import { Test, TestingModule } from '@nestjs/testing';
import { CardDetailsController } from './card-details.controller';
import { CardDetailsService } from './card-details.service';

describe('CardDetailsController', () => {
  let controller: CardDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardDetailsController],
      providers: [CardDetailsService],
    }).compile();

    controller = module.get<CardDetailsController>(CardDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
