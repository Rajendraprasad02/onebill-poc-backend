import { Module } from '@nestjs/common';
import { BillDetailsService } from './bill-details.service';
import { BillDetailController } from './bill-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillDetail } from './entities/bill-detail.entity';
import { User } from 'modules/users/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillDetail, User])],

  controllers: [BillDetailController],
  providers: [BillDetailsService],
})
export class BillDetailsModule {}
