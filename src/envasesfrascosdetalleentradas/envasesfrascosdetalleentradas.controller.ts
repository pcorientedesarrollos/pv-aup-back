import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvasesFrascosDetalleEntradasService } from './envasesfrascosdetalleentradas.service';
import { CreateEnvasesFrascosDetalleEntradasDto } from './dto/create-envases-frascos-detalle-entradas.dto';
import { UpdateEnvasesFrascosDetalleEntradasDto } from './dto/update-envases-frascos-detalle-entradas.dto';

@Controller('envasesfrascosdetalleentradas')
export class EnvasesFrascosDetalleEntradasController {
  constructor(private readonly envasesFrascosDetalleEntradasService: EnvasesFrascosDetalleEntradasService) {}

  @Post()
  create(@Body() createEnvasesFrascosDetalleEntradasDto: CreateEnvasesFrascosDetalleEntradasDto) {
    return this.envasesFrascosDetalleEntradasService.create(createEnvasesFrascosDetalleEntradasDto);
  }

  @Get()
  findAll() {
    return this.envasesFrascosDetalleEntradasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.envasesFrascosDetalleEntradasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnvasesFrascosDetalleEntradasDto: UpdateEnvasesFrascosDetalleEntradasDto) {
    return this.envasesFrascosDetalleEntradasService.update(+id, updateEnvasesFrascosDetalleEntradasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.envasesFrascosDetalleEntradasService.remove(+id);
  }
}
