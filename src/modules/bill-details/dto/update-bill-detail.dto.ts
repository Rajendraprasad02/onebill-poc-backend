import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBillDetailDto } from './create-bill-detail.dto';

export class UpdateBillDetailDto extends PartialType(CreateBillDetailDto) {
  @ApiProperty({ example: true, description: 'Payment status of the bill' })
  isPaid?: boolean;
}
