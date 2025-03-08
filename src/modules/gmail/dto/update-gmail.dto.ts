import { PartialType } from '@nestjs/swagger';
import { CreateGmailDto } from './create-gmail.dto';

export class UpdateGmailDto extends PartialType(CreateGmailDto) {}
