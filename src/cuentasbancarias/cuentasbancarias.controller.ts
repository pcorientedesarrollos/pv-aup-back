import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CuentasBancariasService } from './cuentasbancarias.service';
import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';

@Controller('cuentasbancarias')
export class CuentasBancariasController {
  constructor(private readonly cuentasBancariasService: CuentasBancariasService) {}

  @Post()
  create(@Body() dto: CreateCuentaBancariaDto) {
    return this.cuentasBancariasService.create(dto);
  }

  @Get()
  findAll() {
    return this.cuentasBancariasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuentasBancariasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCuentaBancariaDto) {
    return this.cuentasBancariasService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cuentasBancariasService.remove(+id);
  }
}
