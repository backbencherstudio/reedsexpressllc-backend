import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateDispatcherDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'jane.doe' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({ example: 'Dallas, Texas' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Main fleet dispatcher' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567' })
  @IsOptional()
  @IsString()
  phone_number?: string;
}
