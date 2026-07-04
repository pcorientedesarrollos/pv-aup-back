import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasDetalleMezquiteService } from './cubetas-detalle-mezquite.service';
import { CreateCubetasDetalleMezquiteDto } from './dto/create-cubetas-detalle-mezquite.dto';
import { UpdateCubetasDetalleMezquiteDto } from './dto/update-cubetas-detalle-mezquite.dto';

@Controller('cubetasdetalle-mezquite')
export class CubetasDetalleMezquiteController {
  constructor(private readonly service: CubetasDetalleMezquiteService) {}

  @Post()
  create(@Body() dto: CreateCubetasDetalleMezquiteDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCubetasDetalleMezquiteDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
