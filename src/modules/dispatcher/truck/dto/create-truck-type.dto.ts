import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTruckTypeDto {
  @ApiProperty({ description: 'Unique truck type name', example: 'VAN' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Optional description',
    required: false,
    example: 'Enclosed van trailer',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
