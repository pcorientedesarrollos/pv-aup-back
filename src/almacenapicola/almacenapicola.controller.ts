import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenApicolaService } from './almacenapicola.service';
import { CreateAlmacenApicolaDto } from './dto/create-almacen-apicola.dto';
import { UpdateAlmacenApicolaDto } from './dto/update-almacen-apicola.dto';

@Controller('almacenapicola')
export class AlmacenApicolaController {
  constructor(private readonly almacenApicolaService: AlmacenApicolaService) {}

  @Post()
  create(@Body() dto: CreateAlmacenApicolaDto) {
    return this.almacenApicolaService.create(dto);
  }

  @Get()
  findAll() {
    return this.almacenApicolaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.almacenApicolaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenApicolaDto) {
    return this.almacenApicolaService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.almacenApicolaService.remove(+id);
  }
}
