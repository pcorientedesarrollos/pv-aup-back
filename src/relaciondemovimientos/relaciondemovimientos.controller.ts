import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RelacionDeMovimientosService } from './relaciondemovimientos.service';
import { CreateRelacionMovimientoDto } from './dto/create-relacion-movimiento.dto';
import { UpdateRelacionMovimientoDto } from './dto/update-relacion-movimiento.dto';

@Controller('relaciondemovimientos')
export class RelacionDeMovimientosController {
  constructor(private readonly relacionDeMovimientosService: RelacionDeMovimientosService) {}

  @Post()
  create(@Body() dto: CreateRelacionMovimientoDto) {
    return this.relacionDeMovimientosService.create(dto);
  }

  @Get()
  findAll() {
    return this.relacionDeMovimientosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.relacionDeMovimientosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRelacionMovimientoDto) {
    return this.relacionDeMovimientosService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.relacionDeMovimientosService.remove(+id);
  }
}
