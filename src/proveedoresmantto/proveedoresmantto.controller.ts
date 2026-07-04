import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProveedoresManttoService } from './proveedoresmantto.service';
import { CreateProveedorManttoDto } from './dto/create-proveedor-mantto.dto';
import { UpdateProveedorManttoDto } from './dto/update-proveedor-mantto.dto';

@Controller('proveedoresmantto')
export class ProveedoresManttoController {
  constructor(private readonly proveedoresManttoService: ProveedoresManttoService) {}

  @Post()
  create(@Body() dto: CreateProveedorManttoDto) {
    return this.proveedoresManttoService.create(dto);
  }

  @Get()
  findAll() {
    return this.proveedoresManttoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresManttoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProveedorManttoDto) {
    return this.proveedoresManttoService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedoresManttoService.remove(+id);
  }
}
