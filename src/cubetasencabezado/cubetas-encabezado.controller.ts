import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasEncabezadoService } from './cubetas-encabezado.service';
import { CreateCubetasEncabezadoDto } from './dto/create-cubetas-encabezado.dto';
import { UpdateCubetasEncabezadoDto } from './dto/update-cubetas-encabezado.dto';

@Controller('cubetasencabezado')
export class CubetasEncabezadoController {
  constructor(private readonly service: CubetasEncabezadoService) {}

  @Post()
  create(@Body() dto: CreateCubetasEncabezadoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasEncabezadoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
