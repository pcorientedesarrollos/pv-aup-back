import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localidad } from './entities/localidad.entity';
import { CreateLocalidadDto } from './dto/create-localidad.dto';
import { UpdateLocalidadDto } from './dto/update-localidad.dto';

@Injectable()
export class LocalidadesService {
  constructor(
    @InjectRepository(Localidad)
    private readonly localidadRepository: Repository<Localidad>,
  ) {}

  create(dto: CreateLocalidadDto) {
    const localidad = this.localidadRepository.create(dto);
    return this.localidadRepository.save(localidad);
  }

  findAll() {
    return this.localidadRepository.find();
  }

  async findOne(id: number) {
    const localidad = await this.localidadRepository.findOneBy({ idlocalidad: id });
    if (!localidad) throw new NotFoundException(`Localidad ${id} no encontrada`);
    return localidad;
  }

  async update(id: number, dto: UpdateLocalidadDto) {
    await this.findOne(id);
    await this.localidadRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const localidad = await this.findOne(id);
    return this.localidadRepository.remove(localidad);
  }
}
