import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoNaranjoService } from './almacen-encabezado-naranjo.service';
import { CreateAlmacenEncabezadoNaranjoDto } from './dto/create-almacen-encabezado-naranjo.dto';
import { UpdateAlmacenEncabezadoNaranjoDto } from './dto/update-almacen-encabezado-naranjo.dto';

@Controller('almacenencabezado-naranjo')
export class AlmacenEncabezadoNaranjoController {
  constructor(private readonly service: AlmacenEncabezadoNaranjoService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoNaranjoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoNaranjoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
