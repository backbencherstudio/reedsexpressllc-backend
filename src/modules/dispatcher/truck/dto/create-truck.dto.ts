import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTruckDto {
  @ApiProperty({
    description: 'Carrier id that owns this truck',
    example: 'cmoikc4rl0001vlsgtc1g6vcw',
  })
  @IsString()
  carrier_id: string;

  @ApiProperty({
    description: 'Truck license plate',
    example: 'TX-12345',
  })
  @IsString()
  license_plate: string;

  @ApiPropertyOptional({
    description:
      'Truck type id (references trailer type, e.g. TRACTOR, STRAIGHT, REEFER)',
    example: 'cmojwd2bh0000vld4p05cup7z',
  })
  @IsOptional()
  @IsString()
  truck_type_id?: string;

  @ApiPropertyOptional({
    description: 'Truck make',
    example: 'Freightliner',
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    description: 'Truck model',
    example: 'Cascadia',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Truck manufacturing year',
    example: 2023,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({
    description: 'Vehicle identification number',
    example: '1FUJGLDRXCSBV1234',
  })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({
    description: 'Internal unit number',
    example: 'UNIT-22',
  })
  @IsOptional()
  @IsString()
  unit_number?: string;
}
