import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';

export enum BillingCycle {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class CreatePricingPlanDto {
  @ApiProperty({ example: 'Basic Dispatch' })
  @IsString()
  plan_name: string;

  @ApiProperty({ example: 'Starter plan for small carriers', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  dispatcher_fee?: number;

  @ApiProperty({
    enum: BillingCycle,
    example: BillingCycle.WEEKLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billing_cycle?: BillingCycle;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  billing_day?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    example: ['feat_1', 'feat_2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  feature_ids?: string[];
}
