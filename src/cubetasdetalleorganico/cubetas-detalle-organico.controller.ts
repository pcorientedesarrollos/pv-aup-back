import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasDetalleOrganicoService } from './cubetas-detalle-organico.service';
import { CreateCubetasDetalleOrganicoDto } from './dto/create-cubetas-detalle-organico.dto';
import { UpdateCubetasDetalleOrganicoDto } from './dto/update-cubetas-detalle-organico.dto';

@Controller('cubetasdetalle-organico')
export class CubetasDetalleOrganicoController {
  constructor(private readonly service: CubetasDetalleOrganicoService) {}

  @Post()
  create(@Body() dto: CreateCubetasDetalleOrganicoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasDetalleOrganicoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
