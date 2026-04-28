import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CarrierDocumentDto {
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

  @ApiProperty()
  created_at: Date;
}

export class PricingPlanDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  plan_name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  dispatcher_fee?: string | null;

  @ApiProperty()
  use_default_dispatcher_fee: boolean;

  @ApiPropertyOptional()
  billing_cycle?: string | null;

  @ApiPropertyOptional()
  billing_day?: string | null;

  @ApiProperty()
  is_active: boolean;
}

export class CarrierProfileResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Carrier profile fetched successfully' })
  message: string;

  @ApiProperty()
  data: {
    carrier_id: string;
    legal_name: string;
    dba_name?: string | null;
    mc_number?: string | null;
    dot_number?: string | null;
    address?: string | null;
    contact?: string | null;
    email?: string | null;
    logo?: string | null;
    logo_url?: string | null;
    dispatcher_id?: string | null;
    dispatcher?: {
      id: string;
      full_name: string;
      admin_id?: string | null;
    } | null;
    pricing_plan?: PricingPlanDto | null;
    documents: CarrierDocumentDto[];
    created_at: Date;
    updated_at: Date;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Carrier not found' })
  message: string;
}
