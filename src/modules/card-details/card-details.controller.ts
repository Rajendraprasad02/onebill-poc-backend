import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { CardDetailsService } from './card-details.service';
import { Public } from 'common/decorators/public.decorator';
import { CardDetails } from './entities/card-detail.entity';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

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

  @Public()
  @Put(':userId/:cardId')
  @ApiOperation({ summary: 'Update Card Details' })
  @ApiBody({
    description: 'Card details to be updated',
    type: CardDetails, // Specify the CardDetails DTO or Entity class
  })
  async updateCard(
    @Param('userId') userId: number,
    @Param('cardId') cardId: number,
    @Body() updateData: Partial<CardDetails>,
  ) {
    return this.cardService.updateCard(userId, cardId, updateData);
  }
}
