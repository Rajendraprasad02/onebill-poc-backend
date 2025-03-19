import { Module } from '@nestjs/common';
import { CardDetailsService } from './card-details.service';
import { CardDetailsController } from './card-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardDetails } from './entities/card-detail.entity';
import { User } from 'modules/users/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardDetails, User])],

  controllers: [CardDetailsController],
  providers: [CardDetailsService],
})
export class CardDetailsModule {}
