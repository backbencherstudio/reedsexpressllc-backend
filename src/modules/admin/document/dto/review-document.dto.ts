import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewDocumentDto {
  @ApiProperty({ example: 'approve', enum: ['approve', 'reject'] })
  @IsString()
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({
    example: 'Rejected due to invalid insurance document',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
