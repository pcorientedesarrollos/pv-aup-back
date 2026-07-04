import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvasesFrascosDetalleSalidasService } from './envasesfrascosdetallesalidas.service';
import { CreateEnvasesFrascosDetalleSalidasDto } from './dto/create-envases-frascos-detalle-salidas.dto';
import { UpdateEnvasesFrascosDetalleSalidasDto } from './dto/update-envases-frascos-detalle-salidas.dto';

@Controller('envasesfrascosdetallesalidas')
export class EnvasesFrascosDetalleSalidasController {
  constructor(private readonly envasesFrascosDetalleSalidasService: EnvasesFrascosDetalleSalidasService) {}

  @Post()
  create(@Body() createEnvasesFrascosDetalleSalidasDto: CreateEnvasesFrascosDetalleSalidasDto) {
    return this.envasesFrascosDetalleSalidasService.create(createEnvasesFrascosDetalleSalidasDto);
  }

  @Get()
  findAll() {
    return this.envasesFrascosDetalleSalidasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.envasesFrascosDetalleSalidasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnvasesFrascosDetalleSalidasDto: UpdateEnvasesFrascosDetalleSalidasDto) {
    return this.envasesFrascosDetalleSalidasService.update(+id, updateEnvasesFrascosDetalleSalidasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.envasesFrascosDetalleSalidasService.remove(+id);
  }
}
