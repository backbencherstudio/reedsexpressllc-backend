import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCarrierDocumentDto {
  @ApiProperty({
    description: 'Document type (e.g. INSURANCE, LICENSE, BOL)',
    example: 'INSURANCE',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Optional notes for all uploaded documents',
    example: 'Scanned insurance documents',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description:
      'Optional name to apply to all uploaded documents; defaults to original filename',
    example: 'Insurance-2026.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
