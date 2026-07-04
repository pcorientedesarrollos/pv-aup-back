import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasDetalleAltiplanoService } from './cubetas-detalle-altiplano.service';
import { CreateCubetasDetalleAltiplanoDto } from './dto/create-cubetas-detalle-altiplano.dto';
import { UpdateCubetasDetalleAltiplanoDto } from './dto/update-cubetas-detalle-altiplano.dto';

@Controller('cubetasdetalle-altiplano')
export class CubetasDetalleAltiplanoController {
  constructor(private readonly service: CubetasDetalleAltiplanoService) {}

  @Post()
  create(@Body() dto: CreateCubetasDetalleAltiplanoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasDetalleAltiplanoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
