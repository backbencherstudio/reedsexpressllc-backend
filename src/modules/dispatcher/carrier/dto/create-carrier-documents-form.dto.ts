import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class DocumentMetadataDto {
  @ApiProperty({
    description: 'Document file (multipart field)',
    type: 'string',
    format: 'binary',
  })
  file?: Express.Multer.File;

  @ApiProperty({
    description: 'Document type (e.g. INSURANCE, LICENSE, BOL)',
    example: 'INSURANCE',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Document name',
    example: 'W9 Form',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Optional notes',
    example: 'Signed and dated',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCarrierDocumentsFormDto {
  @ApiProperty({
    description: 'Multiple document files (field name: documents)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  @IsOptional()
  @IsArray()
  documents?: any[];

  @ApiProperty({
    description:
      'JSON string array of metadata for each file. Example: [{"type":"INSURANCE","name":"Policy","notes":"Active"}]',
    type: 'string',
    required: false,
    example:
      '[{"type":"INSURANCE","name":"Policy"},{"type":"LICENSE","name":"License"}]',
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
