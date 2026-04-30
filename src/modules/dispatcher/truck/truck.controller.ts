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
} from '@nestjs/common';
import { TruckService } from './truck.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { Role } from '../../../common/guard/role/role.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateTruckTypeDto } from './dto/create-truck-type.dto';
import { Query } from '@nestjs/common';
import { ListTruckQueryDto } from './dto/list-truck-query.dto';

@ApiBearerAuth('dispatcher-token')
@ApiTags('Truck')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DISPATCHER, Role.ADMIN, Role.SUPERADMIN)
@Controller('truck')
export class TruckController {
  constructor(private readonly truckService: TruckService) {}

  @ApiOperation({ summary: 'Create truck type' })
  @ApiCreatedResponse({ description: 'Truck type created' })
  @ApiBody({ type: CreateTruckTypeDto })
  @Post('truck-type')
  createTruckType(@Req() req: Request, @Body() body: CreateTruckTypeDto) {
    const requesterUserId = req.user.userId;
    return this.truckService.createTruckType(requesterUserId, body);
  }

  @ApiOperation({ summary: 'List truck types' })
  @Get('truck-type')
  listTruckTypes(@Req() req: Request) {
    const requesterUserId = req.user.userId;
    return this.truckService.getTruckTypes(requesterUserId);
  }

  @ApiOperation({ summary: 'Create truck' })
  @ApiCreatedResponse({ description: 'Truck created' })
  @ApiBody({ type: CreateTruckDto })
  @Post()
  create(@Req() req: Request, @Body() createTruckDto: CreateTruckDto) {
    const requesterUserId = req.user.userId;
    return this.truckService.create(requesterUserId, createTruckDto);
  }

  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'TX-12345' })
  @ApiQuery({
    name: 'carrier_id',
    required: false,
    example: 'cmoikc4rl0001vlsgtc1g6vcw',
  })
  @ApiQuery({
    name: 'truck_type_id',
    required: false,
    example: 'cmojwd2bh0000vld4p05cup7z',
  })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListTruckQueryDto) {
    const requesterUserId = req.user.userId;
    return this.truckService.findAll(requesterUserId, query);
  }

  @ApiOperation({ summary: 'Get truck by id' })
  @ApiOkResponse({ description: 'Truck details' })
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.truckService.findOne(requesterUserId, id);
  }

  @ApiOperation({ summary: 'Update truck' })
  @ApiOkResponse({ description: 'Truck updated' })
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTruckDto: UpdateTruckDto,
  ) {
    const requesterUserId = req.user.userId;
    return this.truckService.update(requesterUserId, id, updateTruckDto);
  }

  @ApiOperation({ summary: 'Delete truck' })
  @ApiOkResponse({ description: 'Truck deleted' })
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.truckService.remove(requesterUserId, id);
  }
}
