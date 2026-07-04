import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasEncabezadoAltiplanoService } from './cubetas-encabezado-altiplano.service';
import { CreateCubetasEncabezadoAltiplanoDto } from './dto/create-cubetas-encabezado-altiplano.dto';
import { UpdateCubetasEncabezadoAltiplanoDto } from './dto/update-cubetas-encabezado-altiplano.dto';

@Controller('cubetasencabezado-altiplano')
export class CubetasEncabezadoAltiplanoController {
  constructor(private readonly service: CubetasEncabezadoAltiplanoService) {}

  @Post()
  create(@Body() dto: CreateCubetasEncabezadoAltiplanoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasEncabezadoAltiplanoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
