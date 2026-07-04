import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CubetasDetalleMantequillaService } from './cubetas-detalle-mantequilla.service';
import { CreateCubetasDetalleMantequillaDto } from './dto/create-cubetas-detalle-mantequilla.dto';
import { UpdateCubetasDetalleMantequillaDto } from './dto/update-cubetas-detalle-mantequilla.dto';

@Controller('cubetasdetalle-mantequilla')
export class CubetasDetalleMantequillaController {
  constructor(private readonly service: CubetasDetalleMantequillaService) {}

  @Post()
  create(@Body() dto: CreateCubetasDetalleMantequillaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCubetasDetalleMantequillaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
