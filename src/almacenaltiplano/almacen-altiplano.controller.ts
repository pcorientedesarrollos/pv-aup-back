import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenAltiplanoService } from './almacen-altiplano.service';
import { CreateAlmacenAltiplanoDto } from './dto/create-almacen-altiplano.dto';
import { UpdateAlmacenAltiplanoDto } from './dto/update-almacen-altiplano.dto';

@Controller('almacen-altiplano')
export class AlmacenAltiplanoController {
  constructor(private readonly service: AlmacenAltiplanoService) {}

  @Post()
  create(@Body() dto: CreateAlmacenAltiplanoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenAltiplanoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
