import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GetDispatcherDetailQueryDto {
  @ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value)
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-04-30T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value)
  end_date?: string;

  @ApiPropertyOptional({ description: 'Filter by carrier id' })
  @IsOptional()
  @IsString()
  carrier_id?: string;
}
