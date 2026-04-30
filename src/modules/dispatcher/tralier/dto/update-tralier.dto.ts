import { PartialType } from '@nestjs/swagger';
import { CreateTralierDto } from './create-tralier.dto';

export class UpdateTralierDto extends PartialType(CreateTralierDto) {}
