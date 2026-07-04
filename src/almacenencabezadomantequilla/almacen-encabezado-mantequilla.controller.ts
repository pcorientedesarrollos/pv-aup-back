import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoMantequillaService } from './almacen-encabezado-mantequilla.service';
import { CreateAlmacenEncabezadoMantequillaDto } from './dto/create-almacen-encabezado-mantequilla.dto';
import { UpdateAlmacenEncabezadoMantequillaDto } from './dto/update-almacen-encabezado-mantequilla.dto';

@Controller('almacenencabezado-mantequilla')
export class AlmacenEncabezadoMantequillaController {
  constructor(private readonly service: AlmacenEncabezadoMantequillaService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoMantequillaDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoMantequillaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
