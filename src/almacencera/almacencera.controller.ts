import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenCeraService } from './almacencera.service';
import { CreateAlmacenCeraDto } from './dto/create-almacen-cera.dto';
import { UpdateAlmacenCeraDto } from './dto/update-almacen-cera.dto';

@Controller('almacencera')
export class AlmacenCeraController {
  constructor(private readonly almacenCeraService: AlmacenCeraService) {}

  @Post()
  create(@Body() dto: CreateAlmacenCeraDto) {
    return this.almacenCeraService.create(dto);
  }

  @Get()
  findAll() {
    return this.almacenCeraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.almacenCeraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenCeraDto) {
    return this.almacenCeraService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.almacenCeraService.remove(+id);
  }
}
