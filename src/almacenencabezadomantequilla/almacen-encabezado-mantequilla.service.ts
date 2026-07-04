import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoMantequilla } from './entities/almacen-encabezado-mantequilla.entity';
import { CreateAlmacenEncabezadoMantequillaDto } from './dto/create-almacen-encabezado-mantequilla.dto';
import { UpdateAlmacenEncabezadoMantequillaDto } from './dto/update-almacen-encabezado-mantequilla.dto';

@Injectable()
export class AlmacenEncabezadoMantequillaService {
  constructor(
    @InjectRepository(AlmacenEncabezadoMantequilla)
    private readonly repository: Repository<AlmacenEncabezadoMantequilla>,
  ) {}

  create(dto: CreateAlmacenEncabezadoMantequillaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenEncabezadoMantequilla ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoMantequillaDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
