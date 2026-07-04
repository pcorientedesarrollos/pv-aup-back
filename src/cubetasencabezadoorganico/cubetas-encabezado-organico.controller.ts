import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasEncabezadoOrganicoService } from './cubetas-encabezado-organico.service';
import { CreateCubetasEncabezadoOrganicoDto } from './dto/create-cubetas-encabezado-organico.dto';
import { UpdateCubetasEncabezadoOrganicoDto } from './dto/update-cubetas-encabezado-organico.dto';

@Controller('cubetasencabezado-organico')
export class CubetasEncabezadoOrganicoController {
  constructor(private readonly service: CubetasEncabezadoOrganicoService) {}

  @Post()
  create(@Body() dto: CreateCubetasEncabezadoOrganicoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasEncabezadoOrganicoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
