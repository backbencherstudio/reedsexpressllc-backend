import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateCarrierDto {
  @ApiProperty({
    example: 'Acme Logistics LLC',
    description: 'Legal company name',
  })
  @IsString()
  legal_name: string;

  @ApiProperty({ example: 'Acme', required: false })
  @IsOptional()
  @IsString()
  dba_name?: string;

  @ApiProperty({ example: 'MC123456', required: false })
  @IsOptional()
  @IsString()
  mc_number?: string;

  @ApiProperty({ example: 'DOT789012', required: false })
  @IsOptional()
  @IsString()
  dot_number?: string;

  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+15551234567', required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ example: 'contact@acme.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Logo file (binary). Sent as multipart file field `logo`',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  logo?: any;

  @ApiProperty({ example: 'cmoihhpnq0001vl3kqhn0gbqv', required: false })
  @IsOptional()
  @IsString()
  pricing_plan_id?: string | null;
}
