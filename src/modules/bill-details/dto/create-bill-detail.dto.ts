import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateBillDetailDto {
  @ApiProperty({ example: 'Netflix', description: 'Service provider name' })
  service: string;

  @ApiProperty({ example: 450.99, description: 'Bill amount' })
  amount: number;

  @ApiProperty({ example: '2025-03-15', description: 'Due date of the bill' })
  dueDate: string;

  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  userId: number; // Accept userId in the request body

  @ApiProperty({
    example: false,
    description: 'Payment status of the bill',
    default: false,
  })
  isPaid?: boolean;
}
