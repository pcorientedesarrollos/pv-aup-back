import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuxiliarDeBancosService } from './auxiliardebancos.service';
import { CreateAuxiliarBancoDto } from './dto/create-auxiliar-banco.dto';
import { UpdateAuxiliarBancoDto } from './dto/update-auxiliar-banco.dto';

@Controller('auxiliardebancos')
export class AuxiliarDeBancosController {
  constructor(private readonly auxiliarDeBancosService: AuxiliarDeBancosService) {}

  @Post()
  create(@Body() dto: CreateAuxiliarBancoDto) {
    return this.auxiliarDeBancosService.create(dto);
  }

  @Get()
  findAll() {
    return this.auxiliarDeBancosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auxiliarDeBancosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuxiliarBancoDto) {
    return this.auxiliarDeBancosService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auxiliarDeBancosService.remove(+id);
  }
}
