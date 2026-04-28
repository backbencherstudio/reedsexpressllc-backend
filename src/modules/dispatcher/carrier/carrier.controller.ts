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
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { CarrierService } from './carrier.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { ListCarrierQueryDto } from './dto/list-carrier-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { Role } from '../../../common/guard/role/role.enum';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiBearerAuth('dispatcher-token')
@ApiTags('Carrier')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DISPATCHER, Role.ADMIN, Role.SUPERADMIN)
@Controller('carrier')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @ApiOperation({ summary: 'Create carrier (dispatcher/admin only)' })
  @ApiCreatedResponse({ description: 'Carrier created' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCarrierDto })
  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Req() req: Request,
    @Body() createCarrierDto: CreateCarrierDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const requesterUserId = req.user.userId;
    return this.carrierService.create(requesterUserId, createCarrierDto, logo);
  }

  @ApiOperation({ summary: 'Get all carriers' })
  @ApiOkResponse({ description: 'List of carriers' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'Acme' })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListCarrierQueryDto) {
    const requesterUserId = req.user.userId;
    return this.carrierService.findAll(requesterUserId, query);
  }

  @ApiOperation({ summary: 'Get carrier by id with documents' })
  @ApiOkResponse({ description: 'Carrier details with documents' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.carrierService.findOne(requesterUserId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarrierDto: UpdateCarrierDto) {
    return this.carrierService.update(+id, updateCarrierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carrierService.remove(+id);
  }
}
