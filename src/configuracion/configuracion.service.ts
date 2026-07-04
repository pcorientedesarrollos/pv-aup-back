import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './entities/configuracion.entity';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';

@Injectable()
export class ConfiguracionService implements OnModuleInit {
  constructor(
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
  ) {}

  async onModuleInit() {
    // Check if configuration exists, if not create default
    const count = await this.configuracionRepository.count();
    if (count === 0) {
      const defaultConfig = this.configuracionRepository.create({
        nombreNegocio: 'AUP Punto de Venta',
        direccion: 'Calle Principal #123, Centro',
        telefono: '999 123 4567',
        rfc: 'XAXX010101000',
        mensajeTicket: '¡Gracias por su compra!',
        anchoTicket: '80mm',
        imprimirLogo: false,
      });
      await this.configuracionRepository.save(defaultConfig);
    }
  }

  async getConfiguracion() {
    const config = await this.configuracionRepository.find();
    return config[0]; // There should always be at least one and only one.
  }

  async update(updateConfiguracionDto: UpdateConfiguracionDto) {
    const config = await this.getConfiguracion();
    if (config) {
      Object.assign(config, updateConfiguracionDto);
      return this.configuracionRepository.save(config);
    }
    return null;
  }
}
