import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoOrganicoService } from './almacen-encabezado-organico.service';
import { CreateAlmacenEncabezadoOrganicoDto } from './dto/create-almacen-encabezado-organico.dto';
import { UpdateAlmacenEncabezadoOrganicoDto } from './dto/update-almacen-encabezado-organico.dto';

@Controller('almacenencabezado-organico')
export class AlmacenEncabezadoOrganicoController {
  constructor(private readonly service: AlmacenEncabezadoOrganicoService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoOrganicoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoOrganicoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
