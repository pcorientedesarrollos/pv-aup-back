import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasDetalleAguacateService } from './cubetas-detalle-aguacate.service';
import { CreateCubetasDetalleAguacateDto } from './dto/create-cubetas-detalle-aguacate.dto';
import { UpdateCubetasDetalleAguacateDto } from './dto/update-cubetas-detalle-aguacate.dto';

@Controller('cubetasdetalle-aguacate')
export class CubetasDetalleAguacateController {
  constructor(private readonly service: CubetasDetalleAguacateService) {}

  @Post()
  create(@Body() dto: CreateCubetasDetalleAguacateDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasDetalleAguacateDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
