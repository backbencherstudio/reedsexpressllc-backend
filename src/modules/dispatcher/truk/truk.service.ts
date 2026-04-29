import { Injectable } from '@nestjs/common';
import { CreateTrukDto } from './dto/create-truk.dto';
import { UpdateTrukDto } from './dto/update-truk.dto';

@Injectable()
export class TrukService {
  create(createTrukDto: CreateTrukDto) {
    return 'This action adds a new truk';
  }

  findAll() {
    return `This action returns all truk`;
  }

  findOne(id: number) {
    return `This action returns a #${id} truk`;
  }

  update(id: number, updateTrukDto: UpdateTrukDto) {
    return `This action updates a #${id} truk`;
  }

  remove(id: number) {
    return `This action removes a #${id} truk`;
  }
}
