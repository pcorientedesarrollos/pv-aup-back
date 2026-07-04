import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenEncabezadoMezquiteService } from './almacen-encabezado-mezquite.service';
import { CreateAlmacenEncabezadoMezquiteDto } from './dto/create-almacen-encabezado-mezquite.dto';
import { UpdateAlmacenEncabezadoMezquiteDto } from './dto/update-almacen-encabezado-mezquite.dto';

@Controller('almacenencabezado-mezquite')
export class AlmacenEncabezadoMezquiteController {
  constructor(private readonly service: AlmacenEncabezadoMezquiteService) {}

  @Post()
  create(@Body() dto: CreateAlmacenEncabezadoMezquiteDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenEncabezadoMezquiteDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
