import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOrganizationAdminDto {
  @ApiProperty({
    description: 'Organization admin email',
    example: 'org-admin@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Organization admin password',
    example: 'StrongPass123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Optional username, defaults to email prefix if not provided',
    example: 'orgadmin',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Company name for admin profile',
    example: 'Reeds Express LLC',
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Main St, Dallas, TX',
    required: false,
  })
  @IsOptional()
  @IsString()
  business_address?: string;

  @ApiProperty({
    description: 'Admin full name',
    example: 'John Manager',
    required: false,
  })
  @IsOptional()
  @IsString()
  admin_name?: string;

  @ApiProperty({
    description: 'Website URL',
    example: 'https://reedsxpress.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: 'Logo file (binary). Sent as multipart file field `logo`',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  logo?: any;
}
