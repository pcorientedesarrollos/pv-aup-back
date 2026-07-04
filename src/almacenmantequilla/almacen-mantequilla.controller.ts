import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenMantequillaService } from './almacen-mantequilla.service';
import { CreateAlmacenMantequillaDto } from './dto/create-almacen-mantequilla.dto';
import { UpdateAlmacenMantequillaDto } from './dto/update-almacen-mantequilla.dto';

@Controller('almacen-mantequilla')
export class AlmacenMantequillaController {
  constructor(private readonly service: AlmacenMantequillaService) {}

  @Post()
  create(@Body() dto: CreateAlmacenMantequillaDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenMantequillaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
