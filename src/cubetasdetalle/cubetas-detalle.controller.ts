import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasDetalleService } from './cubetas-detalle.service';
import { CreateCubetasDetalleDto } from './dto/create-cubetas-detalle.dto';
import { UpdateCubetasDetalleDto } from './dto/update-cubetas-detalle.dto';

@Controller('cubetasdetalle')
export class CubetasDetalleController {
  constructor(private readonly service: CubetasDetalleService) {}

  @Post()
  create(@Body() dto: CreateCubetasDetalleDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasDetalleDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
