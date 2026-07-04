import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvasesFrascosEncabezadoEntradasService } from './envasesfrascosencabezadoentradas.service';
import { CreateEnvasesFrascosEncabezadoEntradasDto } from './dto/create-envases-frascos-encabezado-entradas.dto';
import { UpdateEnvasesFrascosEncabezadoEntradasDto } from './dto/update-envases-frascos-encabezado-entradas.dto';

@Controller('envasesfrascosencabezadoentradas')
export class EnvasesFrascosEncabezadoEntradasController {
  constructor(private readonly envasesFrascosEncabezadoEntradasService: EnvasesFrascosEncabezadoEntradasService) {}

  @Post()
  create(@Body() createEnvasesFrascosEncabezadoEntradasDto: CreateEnvasesFrascosEncabezadoEntradasDto) {
    return this.envasesFrascosEncabezadoEntradasService.create(createEnvasesFrascosEncabezadoEntradasDto);
  }

  @Get()
  findAll() {
    return this.envasesFrascosEncabezadoEntradasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.envasesFrascosEncabezadoEntradasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnvasesFrascosEncabezadoEntradasDto: UpdateEnvasesFrascosEncabezadoEntradasDto) {
    return this.envasesFrascosEncabezadoEntradasService.update(+id, updateEnvasesFrascosEncabezadoEntradasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.envasesFrascosEncabezadoEntradasService.remove(+id);
  }
}
