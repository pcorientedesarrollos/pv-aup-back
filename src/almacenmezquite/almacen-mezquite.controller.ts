import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlmacenMezquiteService } from './almacen-mezquite.service';
import { CreateAlmacenMezquiteDto } from './dto/create-almacen-mezquite.dto';
import { UpdateAlmacenMezquiteDto } from './dto/update-almacen-mezquite.dto';

@Controller('almacen-mezquite')
export class AlmacenMezquiteController {
  constructor(private readonly service: AlmacenMezquiteService) {}

  @Post()
  create(@Body() dto: CreateAlmacenMezquiteDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAlmacenMezquiteDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
