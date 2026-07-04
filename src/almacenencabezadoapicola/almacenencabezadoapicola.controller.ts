import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoApicolaService } from './almacenencabezadoapicola.service';
import { CreateAlmacenEncabezadoApicolaDto } from './dto/create-almacen-encabezado-apicola.dto';
import { UpdateAlmacenEncabezadoApicolaDto } from './dto/update-almacen-encabezado-apicola.dto';

@Controller('almacenencabezadoapicola')
export class AlmacenEncabezadoApicolaController {
  constructor(private readonly almacenEncabezadoApicolaService: AlmacenEncabezadoApicolaService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoApicolaDto) {
    return this.almacenEncabezadoApicolaService.create(dto);
  }

  @Get()
  findAll() {
    return this.almacenEncabezadoApicolaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.almacenEncabezadoApicolaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoApicolaDto) {
    return this.almacenEncabezadoApicolaService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.almacenEncabezadoApicolaService.remove(+id);
  }
}
