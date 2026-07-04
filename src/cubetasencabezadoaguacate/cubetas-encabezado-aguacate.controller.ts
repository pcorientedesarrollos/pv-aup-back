import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasEncabezadoAguacateService } from './cubetas-encabezado-aguacate.service';
import { CreateCubetasEncabezadoAguacateDto } from './dto/create-cubetas-encabezado-aguacate.dto';
import { UpdateCubetasEncabezadoAguacateDto } from './dto/update-cubetas-encabezado-aguacate.dto';

@Controller('cubetasencabezado-aguacate')
export class CubetasEncabezadoAguacateController {
  constructor(private readonly service: CubetasEncabezadoAguacateService) {}

  @Post()
  create(@Body() dto: CreateCubetasEncabezadoAguacateDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasEncabezadoAguacateDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
