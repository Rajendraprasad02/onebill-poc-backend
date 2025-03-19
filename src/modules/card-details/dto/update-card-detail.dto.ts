import { PartialType } from '@nestjs/swagger';
import { CreateCardDetailDto } from './create-card-detail.dto';

export class UpdateCardDetailDto extends PartialType(CreateCardDetailDto) {}
