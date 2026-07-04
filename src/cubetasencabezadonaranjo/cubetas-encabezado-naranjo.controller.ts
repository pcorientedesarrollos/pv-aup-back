import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasEncabezadoNaranjoService } from './cubetas-encabezado-naranjo.service';
import { CreateCubetasEncabezadoNaranjoDto } from './dto/create-cubetas-encabezado-naranjo.dto';
import { UpdateCubetasEncabezadoNaranjoDto } from './dto/update-cubetas-encabezado-naranjo.dto';

@Controller('cubetasencabezado-naranjo')
export class CubetasEncabezadoNaranjoController {
  constructor(private readonly service: CubetasEncabezadoNaranjoService) {}

  @Post()
  create(@Body() dto: CreateCubetasEncabezadoNaranjoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasEncabezadoNaranjoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
