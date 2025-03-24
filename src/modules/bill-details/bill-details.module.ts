import { Module } from '@nestjs/common';
import { BillDetailsService } from './bill-details.service';
import { BillDetailController } from './bill-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillDetail } from './entities/bill-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillDetail])],

  controllers: [BillDetailController],
  providers: [BillDetailsService],
})
export class BillDetailsModule {}
