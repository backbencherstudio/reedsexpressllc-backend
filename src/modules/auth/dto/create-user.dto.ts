import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsNotEmpty, MinLength } from 'class-validator';
import { User } from 'src/modules/admin/user/entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  name?: string;

  @IsNotEmpty()
  @ApiProperty()
  first_name?: string;

  @IsNotEmpty()
  @ApiProperty()
  last_name?: string;

  @IsNotEmpty()
  @ApiProperty()
  email?: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be minimum 8' })
  @ApiProperty()
  password: string;

  @ApiProperty({
    enum: UserType,
    enumName: 'UserType',
    example: 'DRIVER',
  })
  type?: UserType;
}
