import { ApiProperty } from '@nestjs/swagger';

class OrganizationAdminDataDto {
  @ApiProperty({ example: 'cmabc123xyz' })
  user_id: string;

  @ApiProperty({ example: 'cmabc123admin' })
  admin_id: string;

  @ApiProperty({ example: 'org-admin@company.com' })
  email: string;

  @ApiProperty({ example: 'org-admin' })
  username: string;

  @ApiProperty({ example: 'Reeds Express LLC' })
  company_name: string;
}

export class CreateOrganizationAdminResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Organization admin created successfully' })
  message: string;

  @ApiProperty({ type: OrganizationAdminDataDto })
  data: OrganizationAdminDataDto;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  message: string;
}
