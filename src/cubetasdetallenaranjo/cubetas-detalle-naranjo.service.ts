import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasDetalleNaranjo } from './entities/cubetas-detalle-naranjo.entity';
import { CreateCubetasDetalleNaranjoDto } from './dto/create-cubetas-detalle-naranjo.dto';
import { UpdateCubetasDetalleNaranjoDto } from './dto/update-cubetas-detalle-naranjo.dto';

@Injectable()
export class CubetasDetalleNaranjoService {
  constructor(
    @InjectRepository(CubetasDetalleNaranjo)
    private readonly repository: Repository<CubetasDetalleNaranjo>,
  ) {}

  create(dto: CreateCubetasDetalleNaranjoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasDetalleNaranjo ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasDetalleNaranjoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
