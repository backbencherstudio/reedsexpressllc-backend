import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ListTruckQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    example: 'TX-12345',
    description: 'Search by license plate, make, model, vin, unit number',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 'cmoikc4rl0001vlsgtc1g6vcw',
    required: false,
  })
  @IsOptional()
  @IsString()
  carrier_id?: string;

  @ApiProperty({
    example: 'cmojwd2bh0000vld4p05cup7z',
    required: false,
  })
  @IsOptional()
  @IsString()
  truck_type_id?: string;
}
