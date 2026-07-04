import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoApicola } from './entities/almacen-encabezado-apicola.entity';
import { CreateAlmacenEncabezadoApicolaDto } from './dto/create-almacen-encabezado-apicola.dto';
import { UpdateAlmacenEncabezadoApicolaDto } from './dto/update-almacen-encabezado-apicola.dto';

@Injectable()
export class AlmacenEncabezadoApicolaService {
  constructor(
    @InjectRepository(AlmacenEncabezadoApicola)
    private readonly almacenEncabezadoApicolaRepository: Repository<AlmacenEncabezadoApicola>,
  ) {}

  create(dto: CreateAlmacenEncabezadoApicolaDto) {
    const encabezado = this.almacenEncabezadoApicolaRepository.create(dto);
    return this.almacenEncabezadoApicolaRepository.save(encabezado);
  }

  findAll() {
    return this.almacenEncabezadoApicolaRepository.find();
  }

  async findOne(id: number) {
    const encabezado = await this.almacenEncabezadoApicolaRepository.findOneBy({ idAlmacen: id });
    if (!encabezado) throw new NotFoundException(`AlmacenEncabezadoApicola ${id} no encontrado`);
    return encabezado;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoApicolaDto) {
    await this.findOne(id);
    await this.almacenEncabezadoApicolaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const encabezado = await this.findOne(id);
    return this.almacenEncabezadoApicolaRepository.remove(encabezado);
  }
}
