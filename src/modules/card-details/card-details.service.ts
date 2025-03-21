import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardDetails } from './entities/card-detail.entity';
import { User } from 'modules/users/user/user.entity';

@Injectable()
export class CardDetailsService {
  constructor(
    @InjectRepository(CardDetails)
    private cardRepository: Repository<CardDetails>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addCards(userId: number, cards: Partial<CardDetails>[]) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const newCards = this.cardRepository.create(
      cards.map((card) => ({ ...card, user })),
    );
    return this.cardRepository.save(newCards);
  }

  async getUserCards(userId: number) {
    return this.cardRepository.find({ where: { user: { id: userId } } });
  }

  async deleteCard(cardId: number) {
    return this.cardRepository.delete(cardId);
  }

  async updateCard(
    userId: number,
    cardId: number,
    updateData: Partial<CardDetails>,
  ) {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, user: { id: userId } },
      relations: ['user'],
    });

    if (!card) {
      throw new Error('Card not found or does not belong to the user');
    }

    Object.assign(card, updateData);
    return this.cardRepository.save(card);
  }
}
