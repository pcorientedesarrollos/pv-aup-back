import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvasesFrascosEncabezadoSalidasService } from './envasesfrascosencabezadosalidas.service';
import { CreateEnvasesFrascosEncabezadoSalidasDto } from './dto/create-envases-frascos-encabezado-salidas.dto';
import { UpdateEnvasesFrascosEncabezadoSalidasDto } from './dto/update-envases-frascos-encabezado-salidas.dto';

@Controller('envasesfrascosencabezadosalidas')
export class EnvasesFrascosEncabezadoSalidasController {
  constructor(private readonly envasesFrascosEncabezadoSalidasService: EnvasesFrascosEncabezadoSalidasService) {}

  @Post()
  create(@Body() createEnvasesFrascosEncabezadoSalidasDto: CreateEnvasesFrascosEncabezadoSalidasDto) {
    return this.envasesFrascosEncabezadoSalidasService.create(createEnvasesFrascosEncabezadoSalidasDto);
  }

  @Get()
  findAll() {
    return this.envasesFrascosEncabezadoSalidasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.envasesFrascosEncabezadoSalidasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnvasesFrascosEncabezadoSalidasDto: UpdateEnvasesFrascosEncabezadoSalidasDto) {
    return this.envasesFrascosEncabezadoSalidasService.update(+id, updateEnvasesFrascosEncabezadoSalidasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.envasesFrascosEncabezadoSalidasService.remove(+id);
  }
}
