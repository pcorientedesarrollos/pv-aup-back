import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DerivadosAlmacenEncabezadoService } from './derivadosalmacenencabezado.service';
import { CreateDerivadosAlmacenEncabezadoDto } from './dto/create-derivados-almacen-encabezado.dto';
import { UpdateDerivadosAlmacenEncabezadoDto } from './dto/update-derivados-almacen-encabezado.dto';

@Controller('derivadosalmacenencabezado')
export class DerivadosAlmacenEncabezadoController {
  constructor(private readonly derivadosAlmacenEncabezadoService: DerivadosAlmacenEncabezadoService) {}

  @Post()
  create(@Body() createDerivadosAlmacenEncabezadoDto: CreateDerivadosAlmacenEncabezadoDto) {
    return this.derivadosAlmacenEncabezadoService.create(createDerivadosAlmacenEncabezadoDto);
  }

  @Get()
  findAll() {
    return this.derivadosAlmacenEncabezadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.derivadosAlmacenEncabezadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDerivadosAlmacenEncabezadoDto: UpdateDerivadosAlmacenEncabezadoDto) {
    return this.derivadosAlmacenEncabezadoService.update(+id, updateDerivadosAlmacenEncabezadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.derivadosAlmacenEncabezadoService.remove(+id);
  }
}
