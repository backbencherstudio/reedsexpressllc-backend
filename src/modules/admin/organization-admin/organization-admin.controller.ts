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
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateOrganizationAdminDto } from './dto/create-organization-admin.dto';
import { UpdateOrganizationAdminDto } from './dto/update-organization-admin.dto';
import { ListOrganizationAdminQueryDto } from './dto/list-organization-admin-query.dto';
import { OrganizationAdminService } from './organization-admin.service';
import {
  CreateOrganizationAdminResponseDto,
  ErrorResponseDto,
} from './dto/create-organization-admin-response.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';

@ApiBearerAuth('super-admin-token')
@ApiTags('Organization Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/organization-admin')
export class OrganizationAdminController {
  constructor(
    private readonly organizationAdminService: OrganizationAdminService,
  ) {}

  @ApiOperation({ summary: 'Create organization admin (super admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateOrganizationAdminDto })
  @ApiCreatedResponse({ type: CreateOrganizationAdminResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Req() req: Request,
    @Body() createOrganizationAdminDto: CreateOrganizationAdminDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const requesterUserId = req.user.userId;
    return this.organizationAdminService.create(
      requesterUserId,
      createOrganizationAdminDto,
      logo,
    );
  }

  @ApiResponse({ description: 'Get all organization admins' })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListOrganizationAdminQueryDto) {
    const requesterUserId = req.user.userId;
    return this.organizationAdminService.findAll(requesterUserId, query);
  }

  @ApiResponse({ description: 'Get one organization admin by id' })
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.organizationAdminService.findOne(requesterUserId, id);
  }

  @ApiResponse({ description: 'Update organization admin by id' })
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateOrganizationAdminDto: UpdateOrganizationAdminDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const requesterUserId = req.user.userId;
    return this.organizationAdminService.update(
      requesterUserId,
      id,
      updateOrganizationAdminDto,
      logo,
    );
  }

  @ApiResponse({ description: 'Delete organization admin by id' })
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const requesterUserId = req.user.userId;
    return this.organizationAdminService.remove(requesterUserId, id);
  }
}
