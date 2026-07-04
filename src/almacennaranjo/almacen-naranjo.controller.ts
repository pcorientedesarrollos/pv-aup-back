import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenNaranjoService } from './almacen-naranjo.service';
import { CreateAlmacenNaranjoDto } from './dto/create-almacen-naranjo.dto';
import { UpdateAlmacenNaranjoDto } from './dto/update-almacen-naranjo.dto';

@Controller('almacen-naranjo')
export class AlmacenNaranjoController {
  constructor(private readonly service: AlmacenNaranjoService) {}

  @Post()
  create(@Body() dto: CreateAlmacenNaranjoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenNaranjoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
