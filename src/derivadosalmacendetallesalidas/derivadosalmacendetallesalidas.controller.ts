import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DerivadosAlmacenDetalleSalidasService } from './derivadosalmacendetallesalidas.service';
import { CreateDerivadosAlmacenDetalleSalidasDto } from './dto/create-derivados-almacen-detalle-salidas.dto';
import { UpdateDerivadosAlmacenDetalleSalidasDto } from './dto/update-derivados-almacen-detalle-salidas.dto';

@Controller('derivadosalmacendetallesalidas')
export class DerivadosAlmacenDetalleSalidasController {
  constructor(private readonly derivadosAlmacenDetalleSalidasService: DerivadosAlmacenDetalleSalidasService) {}

  @Post()
  create(@Body() createDerivadosAlmacenDetalleSalidasDto: CreateDerivadosAlmacenDetalleSalidasDto) {
    return this.derivadosAlmacenDetalleSalidasService.create(createDerivadosAlmacenDetalleSalidasDto);
  }

  @Get()
  findAll() {
    return this.derivadosAlmacenDetalleSalidasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.derivadosAlmacenDetalleSalidasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDerivadosAlmacenDetalleSalidasDto: UpdateDerivadosAlmacenDetalleSalidasDto) {
    return this.derivadosAlmacenDetalleSalidasService.update(+id, updateDerivadosAlmacenDetalleSalidasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.derivadosAlmacenDetalleSalidasService.remove(+id);
  }
}
