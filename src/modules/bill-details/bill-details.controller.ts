import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBillDetailDto } from './dto/create-bill-detail.dto';
import { UpdateBillDetailDto } from './dto/update-bill-detail.dto';
import { BillDetail } from './entities/bill-detail.entity';
import { BillDetailsService } from './bill-details.service';
import { Public } from 'common/decorators/public.decorator';

@ApiTags('Bill Details')
@Controller('bill-details')
export class BillDetailController {
  constructor(private readonly billDetailService: BillDetailsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create one or multiple bills' })
  @ApiResponse({
    status: 201,
    description: 'Bills created successfully',
    type: [BillDetail],
  })
  create(
    @Body() createBillDetailDto: CreateBillDetailDto | CreateBillDetailDto[],
  ): Promise<BillDetail | BillDetail[]> {
    return this.billDetailService.create(createBillDetailDto);
  }
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all bills' })
  @ApiResponse({
    status: 200,
    description: 'List of bills',
    type: [BillDetail],
  })
  findAll(): Promise<BillDetail[]> {
    return this.billDetailService.findAll();
  }
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get bill by ID' })
  @ApiResponse({ status: 200, description: 'Bill found', type: BillDetail })
  findOne(@Param('id') id: number): Promise<BillDetail> {
    return this.billDetailService.findOne(id);
  }
  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a bill' })
  @ApiResponse({
    status: 200,
    description: 'Bill updated successfully',
    type: BillDetail,
  })
  update(
    @Param('id') id: number,
    @Body() updateBillDetailDto: UpdateBillDetailDto,
  ): Promise<BillDetail> {
    return this.billDetailService.update(id, updateBillDetailDto);
  }
  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bill' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  remove(@Param('id') id: number): Promise<void> {
    return this.billDetailService.remove(id);
  }
  @Public()
  @Get('userid/:userId')
  @ApiOperation({ summary: 'Get bills by user ID where isPaid is false' })
  @ApiResponse({ status: 200, description: 'Bills found', type: [BillDetail] })
  findAllByUserId(@Param('userId') userId: number) {
    const userIdNumber = Number(userId); // Convert userId to a number

    return this.billDetailService.findAllByUserId(userIdNumber);
  }
}
