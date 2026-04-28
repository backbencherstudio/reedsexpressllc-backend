import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDispatcherResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Dispatcher created successfully' })
  message: string;

  @ApiProperty()
  data: {
    dispatcher_id: string;
    admin_id: string;
    user_id: string;
    email: string | null;
    username: string | null;
    full_name: string;
    address?: string | null;
    notes?: string | null;
    phone_number?: string | null;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Only admin can create dispatcher' })
  message: string;
}
