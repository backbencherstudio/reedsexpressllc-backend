import { PartialType } from '@nestjs/swagger';
import { CreateTrukDto } from './create-truk.dto';

export class UpdateTrukDto extends PartialType(CreateTrukDto) {}
