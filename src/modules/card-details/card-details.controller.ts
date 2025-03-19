import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardDetailsService } from './card-details.service';
import { Public } from 'common/decorators/public.decorator';

@Controller('cards')
export class CardDetailsController {
  constructor(private readonly cardService: CardDetailsService) {}

  @Public()
  @Post(':userId')
  async addCards(@Param('userId') userId: number, @Body() cards: any[]) {
    return this.cardService.addCards(userId, cards);
  }
  @Public()
  @Get(':userId')
  async getUserCards(@Param('userId') userId: number) {
    return this.cardService.getUserCards(userId);
  }
  @Public()
  @Delete(':cardId')
  async deleteCard(@Param('cardId') cardId: number) {
    return this.cardService.deleteCard(cardId);
  }
}
