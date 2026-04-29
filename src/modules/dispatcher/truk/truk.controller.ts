import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrukService } from './truk.service';
import { CreateTrukDto } from './dto/create-truk.dto';
import { UpdateTrukDto } from './dto/update-truk.dto';

@Controller('truk')
export class TrukController {
  constructor(private readonly trukService: TrukService) {}

  @Post()
  create(@Body() createTrukDto: CreateTrukDto) {
    return this.trukService.create(createTrukDto);
  }

  @Get()
  findAll() {
    return this.trukService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trukService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrukDto: UpdateTrukDto) {
    return this.trukService.update(+id, updateTrukDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trukService.remove(+id);
  }
}
