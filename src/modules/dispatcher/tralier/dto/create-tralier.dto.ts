import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTralierDto {
  @ApiProperty({
    description: 'Carrier id that owns this trailer',
    example: 'cmoikc4rl0001vlsgtc1g6vcw',
  })
  @IsString()
  carrier_id: string;

  @ApiPropertyOptional({
    description: 'Trailer type id',
    example: 'cmojwd2bh0000vld4p05cup7z',
  })
  @IsOptional()
  @IsString()
  trailer_type_id?: string;

  @ApiPropertyOptional({
    description: 'Trailer model',
    example: 'WABASH',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Trailer plate number',
    example: 'TR-12345',
  })
  @IsOptional()
  @IsString()
  plate_number?: string;

  @ApiPropertyOptional({
    description: 'Trailer plate state',
    example: 'TX',
  })
  @IsOptional()
  @IsString()
  plate_state?: string;

  @ApiPropertyOptional({
    description: 'Internal unit number',
    example: 'TRL-22',
  })
  @IsOptional()
  @IsString()
  unit_number?: string;
}
