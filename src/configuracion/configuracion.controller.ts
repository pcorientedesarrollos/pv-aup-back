import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
import { Public } from '../auth/public.decorator';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Public() // Can make this public for fetching basic data if needed, but let's keep it protected normally, except maybe getting the config for printing.
  @Get()
  getConfiguracion() {
    return this.configuracionService.getConfiguracion();
  }

  @Patch()
  update(@Body() updateConfiguracionDto: UpdateConfiguracionDto) {
    return this.configuracionService.update(updateConfiguracionDto);
  }
}
