import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenOrganicoService } from './almacen-organico.service';
import { CreateAlmacenOrganicoDto } from './dto/create-almacen-organico.dto';
import { UpdateAlmacenOrganicoDto } from './dto/update-almacen-organico.dto';

@Controller('almacen-organico')
export class AlmacenOrganicoController {
  constructor(private readonly service: AlmacenOrganicoService) {}

  @Post()
  create(@Body() dto: CreateAlmacenOrganicoDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenOrganicoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
