import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoAltiplano } from './entities/almacen-encabezado-altiplano.entity';
import { CreateAlmacenEncabezadoAltiplanoDto } from './dto/create-almacen-encabezado-altiplano.dto';
import { UpdateAlmacenEncabezadoAltiplanoDto } from './dto/update-almacen-encabezado-altiplano.dto';

@Injectable()
export class AlmacenEncabezadoAltiplanoService {
  constructor(
    @InjectRepository(AlmacenEncabezadoAltiplano)
    private readonly repository: Repository<AlmacenEncabezadoAltiplano>,
  ) {}

  create(dto: CreateAlmacenEncabezadoAltiplanoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenEncabezadoAltiplano ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoAltiplanoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
