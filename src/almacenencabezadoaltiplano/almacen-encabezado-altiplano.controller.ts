import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoAltiplanoService } from './almacen-encabezado-altiplano.service';
import { CreateAlmacenEncabezadoAltiplanoDto } from './dto/create-almacen-encabezado-altiplano.dto';
import { UpdateAlmacenEncabezadoAltiplanoDto } from './dto/update-almacen-encabezado-altiplano.dto';

@Controller('almacenencabezado-altiplano')
export class AlmacenEncabezadoAltiplanoController {
  constructor(private readonly service: AlmacenEncabezadoAltiplanoService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoAltiplanoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoAltiplanoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
