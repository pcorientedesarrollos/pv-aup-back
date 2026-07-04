import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoOrganico } from './entities/almacen-encabezado-organico.entity';
import { CreateAlmacenEncabezadoOrganicoDto } from './dto/create-almacen-encabezado-organico.dto';
import { UpdateAlmacenEncabezadoOrganicoDto } from './dto/update-almacen-encabezado-organico.dto';

@Injectable()
export class AlmacenEncabezadoOrganicoService {
  constructor(
    @InjectRepository(AlmacenEncabezadoOrganico)
    private readonly repository: Repository<AlmacenEncabezadoOrganico>,
  ) {}

  create(dto: CreateAlmacenEncabezadoOrganicoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenEncabezadoOrganico ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoOrganicoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
