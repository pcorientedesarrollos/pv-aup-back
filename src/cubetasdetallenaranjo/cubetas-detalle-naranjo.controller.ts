import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasDetalleNaranjoService } from './cubetas-detalle-naranjo.service';
import { CreateCubetasDetalleNaranjoDto } from './dto/create-cubetas-detalle-naranjo.dto';
import { UpdateCubetasDetalleNaranjoDto } from './dto/update-cubetas-detalle-naranjo.dto';

@Controller('cubetasdetalle-naranjo')
export class CubetasDetalleNaranjoController {
  constructor(private readonly service: CubetasDetalleNaranjoService) {}

  @Post()
  create(@Body() dto: CreateCubetasDetalleNaranjoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasDetalleNaranjoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
