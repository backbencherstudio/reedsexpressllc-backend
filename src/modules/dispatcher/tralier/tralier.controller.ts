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
import { TralierService } from './tralier.service';
import { CreateTralierDto } from './dto/create-tralier.dto';
import { UpdateTralierDto } from './dto/update-tralier.dto';
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
import { Query } from '@nestjs/common';
import { ListTralierQueryDto } from './dto/list-tralier-query.dto';

@ApiBearerAuth('dispatcher-token')
@ApiTags('Trailer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DISPATCHER, Role.ADMIN, Role.SUPERADMIN)
@Controller('tralier')
export class TralierController {
  constructor(private readonly tralierService: TralierService) {}

  @ApiOperation({ summary: 'Create trailer type' })
  @ApiCreatedResponse({ description: 'Trailer type created' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'VAN' },
        description: { type: 'string', example: 'Enclosed van trailer' },
      },
      required: ['name'],
    },
  })
  @Post('trailer-type')
  createTralierType(
    @Req() req: Request,
    @Body() body: { name: string; description?: string },
  ) {
    const requesterUserId = req.user.userId;
    return this.tralierService.createTralierType(requesterUserId, body);
  }

  @ApiOperation({ summary: 'List trailer types' })
  @ApiOkResponse({ description: 'List of trailer types' })
  @Get('trailer-type')
  getTralierTypes(@Req() req: Request) {
    const requesterUserId = req.user.userId;
    return this.tralierService.getTralierTypes(requesterUserId);
  }

  @ApiOperation({ summary: 'Create trailer' })
  @ApiCreatedResponse({ description: 'Trailer created successfully' })
  @ApiBody({ type: CreateTralierDto })
  @Post()
  create(@Req() req: Request, @Body() createTralierDto: CreateTralierDto) {
    const requesterUserId = req.user.userId;
    return this.tralierService.create(requesterUserId, createTralierDto);
  }

  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'TR-12345' })
  @ApiQuery({
    name: 'carrier_id',
    required: false,
    example: 'cmoikc4rl0001vlsgtc1g6vcw',
  })
  @ApiQuery({
    name: 'trailer_type_id',
    required: false,
    example: 'cmojwd2bh0000vld4p05cup7z',
  })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListTralierQueryDto) {
    const requesterUserId = req.user.userId;
    return this.tralierService.findAll(requesterUserId, query);
  }

  @ApiOperation({ summary: 'Get trailer by id' })
  @ApiOkResponse({ description: 'Trailer details' })
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.tralierService.findOne(requesterUserId, id);
  }

  @ApiOperation({ summary: 'Update trailer' })
  @ApiOkResponse({ description: 'Trailer updated successfully' })
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTralierDto: UpdateTralierDto,
  ) {
    const requesterUserId = req.user.userId;
    return this.tralierService.update(requesterUserId, id, updateTralierDto);
  }

  @ApiOperation({ summary: 'Delete trailer' })
  @ApiOkResponse({ description: 'Trailer deleted successfully' })
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.tralierService.remove(requesterUserId, id);
  }
}
