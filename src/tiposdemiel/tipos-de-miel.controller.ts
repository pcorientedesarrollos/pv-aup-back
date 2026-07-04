import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TiposDeMielService } from './tipos-de-miel.service';
import { CreateTiposDeMielDto } from './dto/create-tipos-de-miel.dto';
import { UpdateTiposDeMielDto } from './dto/update-tipos-de-miel.dto';

@Controller('tiposdemiel')
export class TiposDeMielController {
  constructor(private readonly tiposDeMielService: TiposDeMielService) {}

  @Post()
  create(@Body() dto: CreateTiposDeMielDto) {
    return this.tiposDeMielService.create(dto);
  }

  @Get()
  findAll() {
    return this.tiposDeMielService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposDeMielService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTiposDeMielDto) {
    return this.tiposDeMielService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposDeMielService.remove(+id);
  }
}
