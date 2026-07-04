import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DerivadosAlmacenEncabezadoSalidasService } from './derivadosalmacenencabezadosalidas.service';
import { CreateDerivadosAlmacenEncabezadoSalidasDto } from './dto/create-derivados-almacen-encabezado-salidas.dto';
import { UpdateDerivadosAlmacenEncabezadoSalidasDto } from './dto/update-derivados-almacen-encabezado-salidas.dto';

@Controller('derivadosalmacenencabezadosalidas')
export class DerivadosAlmacenEncabezadoSalidasController {
  constructor(private readonly derivadosAlmacenEncabezadoSalidasService: DerivadosAlmacenEncabezadoSalidasService) {}

  @Post()
  create(@Body() createDerivadosAlmacenEncabezadoSalidasDto: CreateDerivadosAlmacenEncabezadoSalidasDto) {
    return this.derivadosAlmacenEncabezadoSalidasService.create(createDerivadosAlmacenEncabezadoSalidasDto);
  }

  @Get()
  findAll() {
    return this.derivadosAlmacenEncabezadoSalidasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.derivadosAlmacenEncabezadoSalidasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDerivadosAlmacenEncabezadoSalidasDto: UpdateDerivadosAlmacenEncabezadoSalidasDto) {
    return this.derivadosAlmacenEncabezadoSalidasService.update(+id, updateDerivadosAlmacenEncabezadoSalidasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.derivadosAlmacenEncabezadoSalidasService.remove(+id);
  }
}
