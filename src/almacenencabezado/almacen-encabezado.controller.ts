import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoService } from './almacen-encabezado.service';
import { CreateAlmacenEncabezadoDto } from './dto/create-almacen-encabezado.dto';
import { UpdateAlmacenEncabezadoDto } from './dto/update-almacen-encabezado.dto';

@Controller('almacenencabezado')
export class AlmacenEncabezadoController {
  constructor(private readonly almacenEncabezadoService: AlmacenEncabezadoService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoDto) {
    return this.almacenEncabezadoService.create(dto);
  }

  @Get()
  findAll() {
    return this.almacenEncabezadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.almacenEncabezadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoDto) {
    return this.almacenEncabezadoService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.almacenEncabezadoService.remove(+id);
  }
}
