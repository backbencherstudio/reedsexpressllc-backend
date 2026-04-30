import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTralierTypeDto {
  @ApiProperty({
    description: 'Unique trailer type name',
    example: 'VAN',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Enclosed van trailer',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
