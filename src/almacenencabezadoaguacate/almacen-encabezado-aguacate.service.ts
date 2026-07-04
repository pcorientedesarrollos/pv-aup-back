import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoAguacate } from './entities/almacen-encabezado-aguacate.entity';
import { CreateAlmacenEncabezadoAguacateDto } from './dto/create-almacen-encabezado-aguacate.dto';
import { UpdateAlmacenEncabezadoAguacateDto } from './dto/update-almacen-encabezado-aguacate.dto';

@Injectable()
export class AlmacenEncabezadoAguacateService {
  constructor(
    @InjectRepository(AlmacenEncabezadoAguacate)
    private readonly repository: Repository<AlmacenEncabezadoAguacate>,
  ) {}

  create(dto: CreateAlmacenEncabezadoAguacateDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenEncabezadoAguacate ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoAguacateDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
