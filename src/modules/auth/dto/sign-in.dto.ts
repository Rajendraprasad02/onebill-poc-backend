import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({ description: 'The password of the user', required: false })
  @IsString({ message: 'Password must be a string' })
  @IsOptional() // Make password optional
  password?: string;
}
