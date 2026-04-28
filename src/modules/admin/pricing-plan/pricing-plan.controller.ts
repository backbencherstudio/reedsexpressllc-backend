import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PricingPlanService } from './pricing-plan.service';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { Role } from '../../../common/guard/role/role.enum';
import {
  CreatePricingPlanResponseDto,
  ErrorResponseDto,
} from './dto/create-pricing-plan-response.dto';
import { ListPricingPlanQueryDto } from './dto/list-pricing-plan-query.dto';

@ApiBearerAuth('admin-token')
@ApiBearerAuth('super-admin-token')
@ApiTags('PricingPlan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/pricing-plan')
export class PricingPlanController {
  constructor(private readonly pricingPlanService: PricingPlanService) {}

  @ApiOperation({ summary: 'Create pricing plan (admin only)' })
  @ApiCreatedResponse({ type: CreatePricingPlanResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @Post()
  create(
    @Req() req: Request,
    @Body() createPricingPlanDto: CreatePricingPlanDto,
  ) {
    const requesterUserId = req.user.userId;
    return this.pricingPlanService.create(
      requesterUserId,
      createPricingPlanDto,
    );
  }

  @ApiResponse({ description: 'Get all pricing plans' })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListPricingPlanQueryDto) {
    const requesterUserId = req.user.userId;
    return this.pricingPlanService.findAll(requesterUserId, query);
  }

  @ApiOperation({ summary: 'Get one pricing plan by id' })
  @ApiResponse({ status: 200, description: 'Pricing plan retrieved' })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingPlanService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update pricing plan by id (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Pricing plan updated successfully',
  })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePricingPlanDto: UpdatePricingPlanDto,
  ) {
    const requesterUserId = req.user.userId;
    return this.pricingPlanService.update(
      requesterUserId,
      id,
      updatePricingPlanDto,
    );
  }

  @ApiOperation({ summary: 'Delete pricing plan by id (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Pricing plan deleted successfully',
  })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.pricingPlanService.remove(requesterUserId, id);
  }

  @ApiOperation({ summary: 'Get all available features' })
  @Get('features/all')
  getFeatures() {
    return this.pricingPlanService.getFeatures();
  }
}
