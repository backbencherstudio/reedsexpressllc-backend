import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function ApiAuthRoles() {
  return applyDecorators(
    ApiBearerAuth('super-admin-token'),
    ApiBearerAuth('admin-token'),
    ApiBearerAuth('dispatcher-token'),
    ApiBearerAuth('driver-token'),
  );
}
