import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasEncabezadoNaranjo } from './entities/cubetas-encabezado-naranjo.entity';
import { CreateCubetasEncabezadoNaranjoDto } from './dto/create-cubetas-encabezado-naranjo.dto';
import { UpdateCubetasEncabezadoNaranjoDto } from './dto/update-cubetas-encabezado-naranjo.dto';

@Injectable()
export class CubetasEncabezadoNaranjoService {
  constructor(
    @InjectRepository(CubetasEncabezadoNaranjo)
    private readonly repository: Repository<CubetasEncabezadoNaranjo>,
  ) {}

  create(dto: CreateCubetasEncabezadoNaranjoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasEncabezadoNaranjo ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasEncabezadoNaranjoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
