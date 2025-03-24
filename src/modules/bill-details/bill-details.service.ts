import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBillDetailDto } from './dto/create-bill-detail.dto';
import { UpdateBillDetailDto } from './dto/update-bill-detail.dto';
import { BillDetail } from './entities/bill-detail.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BillDetailsService {
  constructor(
    @InjectRepository(BillDetail)
    private readonly billDetailRepository: Repository<BillDetail>,
  ) {}

  async create(
    createBillDetailDto: CreateBillDetailDto | CreateBillDetailDto[],
  ): Promise<BillDetail | BillDetail[]> {
    if (Array.isArray(createBillDetailDto)) {
      const bills = this.billDetailRepository.create(createBillDetailDto);
      return await this.billDetailRepository.save(bills);
    }
    const bill = this.billDetailRepository.create(createBillDetailDto);
    return await this.billDetailRepository.save(bill);
  }

  async findAll(): Promise<BillDetail[]> {
    return await this.billDetailRepository.find();
  }

  async findOne(id: number): Promise<BillDetail> {
    const bill = await this.billDetailRepository.findOne({ where: { id } });
    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }
    return bill;
  }

  async update(
    id: number,
    updateBillDetailDto: UpdateBillDetailDto,
  ): Promise<BillDetail> {
    await this.billDetailRepository.update(id, updateBillDetailDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.billDetailRepository.delete(id);
  }
}
