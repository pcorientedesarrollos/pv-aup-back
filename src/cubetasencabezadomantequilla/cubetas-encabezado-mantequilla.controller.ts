import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasEncabezadoMantequillaService } from './cubetas-encabezado-mantequilla.service';
import { CreateCubetasEncabezadoMantequillaDto } from './dto/create-cubetas-encabezado-mantequilla.dto';
import { UpdateCubetasEncabezadoMantequillaDto } from './dto/update-cubetas-encabezado-mantequilla.dto';

@Controller('cubetasencabezado-mantequilla')
export class CubetasEncabezadoMantequillaController {
  constructor(private readonly service: CubetasEncabezadoMantequillaService) {}

  @Post()
  create(@Body() dto: CreateCubetasEncabezadoMantequillaDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasEncabezadoMantequillaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
