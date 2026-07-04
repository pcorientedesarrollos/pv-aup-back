import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoAguacateService } from './almacen-encabezado-aguacate.service';
import { CreateAlmacenEncabezadoAguacateDto } from './dto/create-almacen-encabezado-aguacate.dto';
import { UpdateAlmacenEncabezadoAguacateDto } from './dto/update-almacen-encabezado-aguacate.dto';

@Controller('almacenencabezado-aguacate')
export class AlmacenEncabezadoAguacateController {
  constructor(private readonly service: AlmacenEncabezadoAguacateService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoAguacateDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoAguacateDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
