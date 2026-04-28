import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentListItemDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  name?: string | null;

  @ApiPropertyOptional()
  type?: string | null;

  @ApiPropertyOptional()
  file?: string | null;

  @ApiPropertyOptional()
  status?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  approved_at?: Date | null;

  @ApiPropertyOptional()
  approved_by?: string | null;

  @ApiPropertyOptional()
  carrier_id?: string | null;

  @ApiPropertyOptional()
  driver_id?: string | null;

  @ApiPropertyOptional()
  load_id?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class DocumentListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Documents fetched successfully' })
  message: string;

  @ApiProperty({ type: [DocumentListItemDto] })
  data: DocumentListItemDto[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Access denied' })
  message: string;
}
