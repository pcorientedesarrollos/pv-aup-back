import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezado } from './entities/almacen-encabezado.entity';
import { CreateAlmacenEncabezadoDto } from './dto/create-almacen-encabezado.dto';
import { UpdateAlmacenEncabezadoDto } from './dto/update-almacen-encabezado.dto';

@Injectable()
export class AlmacenEncabezadoService {
  constructor(
    @InjectRepository(AlmacenEncabezado)
    private readonly repository: Repository<AlmacenEncabezado>,
  ) {}

  create(dto: CreateAlmacenEncabezadoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenEncabezado ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
