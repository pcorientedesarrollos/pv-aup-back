import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoCeraService } from './almacenencabezadocera.service';
import { CreateAlmacenEncabezadoCeraDto } from './dto/create-almacen-encabezado-cera.dto';
import { UpdateAlmacenEncabezadoCeraDto } from './dto/update-almacen-encabezado-cera.dto';

@Controller('almacenencabezadocera')
export class AlmacenEncabezadoCeraController {
  constructor(private readonly almacenEncabezadoCeraService: AlmacenEncabezadoCeraService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoCeraDto) {
    return this.almacenEncabezadoCeraService.create(dto);
  }

  @Get()
  findAll() {
    return this.almacenEncabezadoCeraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.almacenEncabezadoCeraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoCeraDto) {
    return this.almacenEncabezadoCeraService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.almacenEncabezadoCeraService.remove(+id);
  }
}
