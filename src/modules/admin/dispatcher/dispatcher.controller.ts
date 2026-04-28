import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DispatcherService } from './dispatcher.service';
import { CreateDispatcherDto } from './dto/create-dispatcher.dto';
import { GetDispatcherDetailQueryDto } from './dto/get-dispatcher-detail-query.dto';
import { UpdateDispatcherDto } from './dto/update-dispatcher.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ListDispatcherQueryDto } from './dto/list-dispatcher-query.dto';
import {
  CreateDispatcherResponseDto,
  ErrorResponseDto,
} from './dto/create-dispatcher-response.dto';
import { CarrierProfileResponseDto } from './dto/carrier-profile-response.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@ApiBearerAuth('admin-token')
@ApiBearerAuth('super-admin-token')
@ApiTags('Dispatcher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/dispatcher')
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) {}

  @ApiOperation({ summary: 'Create dispatcher (admin only)' })
  @ApiCreatedResponse({ type: CreateDispatcherResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @Post()
  create(
    @Req() req: Request,
    @Body() createDispatcherDto: CreateDispatcherDto,
  ) {
    const requesterUserId = req.user.userId;
    return this.dispatcherService.create(requesterUserId, createDispatcherDto);
  }

  @ApiResponse({ description: 'Get all dispatchers' })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListDispatcherQueryDto) {
    const requesterUserId = req.user.userId;
    return this.dispatcherService.findAll(requesterUserId, query);
  }

  @ApiResponse({ description: 'Get one dispatcher by id' })
  @Get(':id')
  findOne(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() query: GetDispatcherDetailQueryDto,
  ) {
    const requesterUserId = req.user.userId;
    return this.dispatcherService.findOne(requesterUserId, id, query);
  }

  @ApiOperation({
    summary: 'Get carrier profile detail with documents and pricing plan',
  })
  @ApiOkResponse({ type: CarrierProfileResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @Get('carrier/:carrierId')
  findOneCarrier(@Req() req: Request, @Param('carrierId') carrierId: string) {
    const requesterUserId = req.user.userId;
    return this.dispatcherService.findOneCarrier(requesterUserId, carrierId);
  }

  @ApiResponse({ description: 'Update dispatcher by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDispatcherDto: UpdateDispatcherDto,
  ) {
    return this.dispatcherService.update(+id, updateDispatcherDto);
  }

  @ApiResponse({ description: 'Delete dispatcher by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispatcherService.remove(+id);
  }
}
