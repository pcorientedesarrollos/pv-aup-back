import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenAguacateService } from './almacen-aguacate.service';
import { CreateAlmacenAguacateDto } from './dto/create-almacen-aguacate.dto';
import { UpdateAlmacenAguacateDto } from './dto/update-almacen-aguacate.dto';

@Controller('almacen-aguacate')
export class AlmacenAguacateController {
  constructor(private readonly almacenAguacateService: AlmacenAguacateService) {}

  @Post()
  create(@Body() dto: CreateAlmacenAguacateDto) {
    return this.almacenAguacateService.create(dto);
  }

  @Get()
  findAll() {
    return this.almacenAguacateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.almacenAguacateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenAguacateDto) {
    return this.almacenAguacateService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.almacenAguacateService.remove(+id);
  }
}
