import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoNaranjo } from './entities/almacen-encabezado-naranjo.entity';
import { CreateAlmacenEncabezadoNaranjoDto } from './dto/create-almacen-encabezado-naranjo.dto';
import { UpdateAlmacenEncabezadoNaranjoDto } from './dto/update-almacen-encabezado-naranjo.dto';

@Injectable()
export class AlmacenEncabezadoNaranjoService {
  constructor(
    @InjectRepository(AlmacenEncabezadoNaranjo)
    private readonly repository: Repository<AlmacenEncabezadoNaranjo>,
  ) {}

  create(dto: CreateAlmacenEncabezadoNaranjoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenEncabezadoNaranjo ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoNaranjoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
