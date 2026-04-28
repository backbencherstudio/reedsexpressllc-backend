import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationAdminDto } from './create-organization-admin.dto';

export class UpdateOrganizationAdminDto extends PartialType(
  CreateOrganizationAdminDto,
) {}
