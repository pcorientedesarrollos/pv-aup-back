import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DerivadosAlmacenDetalleService } from './derivadosalmacendetalle.service';
import { CreateDerivadosAlmacenDetalleDto } from './dto/create-derivados-almacen-detalle.dto';
import { UpdateDerivadosAlmacenDetalleDto } from './dto/update-derivados-almacen-detalle.dto';

@Controller('derivadosalmacendetalle')
export class DerivadosAlmacenDetalleController {
  constructor(private readonly derivadosAlmacenDetalleService: DerivadosAlmacenDetalleService) {}

  @Post()
  create(@Body() createDerivadosAlmacenDetalleDto: CreateDerivadosAlmacenDetalleDto) {
    return this.derivadosAlmacenDetalleService.create(createDerivadosAlmacenDetalleDto);
  }

  @Get()
  findAll() {
    return this.derivadosAlmacenDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.derivadosAlmacenDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDerivadosAlmacenDetalleDto: UpdateDerivadosAlmacenDetalleDto) {
    return this.derivadosAlmacenDetalleService.update(+id, updateDerivadosAlmacenDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.derivadosAlmacenDetalleService.remove(+id);
  }
}
