import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasEncabezadoMezquiteService } from './cubetas-encabezado-mezquite.service';
import { CreateCubetasEncabezadoMezquiteDto } from './dto/create-cubetas-encabezado-mezquite.dto';
import { UpdateCubetasEncabezadoMezquiteDto } from './dto/update-cubetas-encabezado-mezquite.dto';

@Controller('cubetasencabezado-mezquite')
export class CubetasEncabezadoMezquiteController {
  constructor(private readonly service: CubetasEncabezadoMezquiteService) {}

  @Post()
  create(@Body() dto: CreateCubetasEncabezadoMezquiteDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasEncabezadoMezquiteDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
