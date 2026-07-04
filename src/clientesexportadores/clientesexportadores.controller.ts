import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientesExportadoresService } from './clientesexportadores.service';
import { CreateClienteExportadorDto } from './dto/create-cliente-exportador.dto';
import { UpdateClienteExportadorDto } from './dto/update-cliente-exportador.dto';

@Controller('clientesexportadores')
export class ClientesExportadoresController {
  constructor(private readonly clientesExportadoresService: ClientesExportadoresService) {}

  @Post()
  create(@Body() dto: CreateClienteExportadorDto) {
    return this.clientesExportadoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.clientesExportadoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesExportadoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClienteExportadorDto) {
    return this.clientesExportadoresService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesExportadoresService.remove(+id);
  }
}
