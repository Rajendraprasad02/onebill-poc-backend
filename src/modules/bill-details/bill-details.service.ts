import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBillDetailDto } from './dto/create-bill-detail.dto';
import { UpdateBillDetailDto } from './dto/update-bill-detail.dto';
import { BillDetail } from './entities/bill-detail.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'modules/users/user/user.entity';

@Injectable()
export class BillDetailsService {
  private paymentCounter = 0;

  constructor(
    @InjectRepository(BillDetail)
    private readonly billDetailRepository: Repository<BillDetail>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createBillDetailDto: CreateBillDetailDto | CreateBillDetailDto[],
  ): Promise<BillDetail | BillDetail[]> {
    if (Array.isArray(createBillDetailDto)) {
      const uniqueBills = [];

      for (const dto of createBillDetailDto) {
        const existingBill = await this.billDetailRepository.findOne({
          where: {
            user: { id: dto.userId }, // Reference user relation properly
            service: dto.service,
            dueDate: dto.dueDate,
            amount: dto.amount,
          },
        });

        if (!existingBill) {
          const user = await this.userRepository.findOne({
            where: { id: dto.userId },
          });
          if (!user) throw new Error(`User with id ${dto.userId} not found`);

          uniqueBills.push({ ...dto, user }); // Assign the User entity
        }
      }

      if (uniqueBills.length > 0) {
        return await this.billDetailRepository.save(uniqueBills);
      }

      return [];
    }

    const existingBill = await this.billDetailRepository.findOne({
      where: {
        user: { id: createBillDetailDto.userId }, // Correct way for relations
        service: createBillDetailDto.service,
        dueDate: createBillDetailDto.dueDate,
        amount: createBillDetailDto.amount,
      },
    });

    if (existingBill) {
      return existingBill; // Avoid duplicate insertion
    }
    const user = await this.userRepository.findOne({
      where: { id: createBillDetailDto.userId },
    });
    if (!user)
      throw new Error(`User with id ${createBillDetailDto.userId} not found`);

    return await this.billDetailRepository.save({
      ...createBillDetailDto,
      user,
    });
  }

  async findAll(): Promise<BillDetail[]> {
    return await this.billDetailRepository.find();
  }

  async findAllByUserId(userId: number): Promise<BillDetail[]> {
    return await this.billDetailRepository.find({
      where: {
        user: { id: userId },
      },
    });
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
    this.paymentCounter++;

    if (this.paymentCounter % 3 === 0) {
      const errorMessages = [
        'Payment failed due to insufficient balance.',
        'Payment gateway error. Please try again later.',
        'Bank declined the transaction. Contact your bank.',
        'Transaction limit exceeded. Try a smaller amount.',
      ];
      const randomError =
        errorMessages[Math.floor(Math.random() * errorMessages.length)];
      throw new BadRequestException(randomError);
    }

    await this.billDetailRepository.save({ id, ...updateBillDetailDto });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.billDetailRepository.delete(id);
  }
}
