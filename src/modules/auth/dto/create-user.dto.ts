import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'username' })
  @IsString()
  username: string;
  @ApiProperty({ description: 'password' })
  @IsString()
  password: string;
  @ApiProperty({ description: 'email' })
  @IsEmail()
  @IsOptional()
  email: string;
}

export class SetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
