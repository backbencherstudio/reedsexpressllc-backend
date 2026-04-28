import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { ListDocumentQueryDto } from './dto/list-document-query.dto';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { ReviewDocumentDto } from './dto/review-document.dto';

@ApiBearerAuth('admin-token')
@ApiBearerAuth('super-admin-token')
@ApiTags('Document')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @ApiOperation({ summary: 'Get all documents with filter and pagination' })
  @ApiOkResponse({ description: 'Documents fetched successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Get()
  findAll(@Req() req: Request, @Query() query: ListDocumentQueryDto) {
    const requesterUserId = req.user.userId;
    return this.documentService.findAll(requesterUserId, query);
  }

  @ApiOperation({ summary: 'Approve or reject document' })
  @ApiOkResponse({ description: 'Document review completed successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Patch(':id/review')
  review(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() reviewDocumentDto: ReviewDocumentDto,
  ) {
    const requesterUserId = req.user.userId;
    return this.documentService.reviewDocument(
      requesterUserId,
      id,
      reviewDocumentDto,
    );
  }
}
