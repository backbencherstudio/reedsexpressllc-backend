import { ApiProperty } from '@nestjs/swagger';

class FeatureDto {
  @ApiProperty({ example: 'feat_abc123' })
  id: string;

  @ApiProperty({ example: 'Load Dispatching' })
  name: string;

  @ApiProperty({ example: 'Full load management and dispatching services' })
  description?: string;
}

class PlanFeatureDto {
  @ApiProperty({ type: FeatureDto })
  feature: FeatureDto;
}

class PricingPlanDataDto {
  @ApiProperty({ example: 'plan_abc123' })
  id: string;

  @ApiProperty({ example: 'Basic Dispatch' })
  plan_name: string;

  @ApiProperty({ example: 5 })
  dispatcher_fee?: number;

  @ApiProperty({ example: true })
  is_active?: boolean;

  @ApiProperty({ type: [PlanFeatureDto] })
  included_features?: PlanFeatureDto[];
}

export class CreatePricingPlanResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Pricing plan created successfully' })
  message: string;

  @ApiProperty({ type: PricingPlanDataDto })
  data: PricingPlanDataDto;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  message: string;
}
