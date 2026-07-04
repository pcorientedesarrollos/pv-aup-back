import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasEncabezadoAltiplano } from './entities/cubetas-encabezado-altiplano.entity';
import { CreateCubetasEncabezadoAltiplanoDto } from './dto/create-cubetas-encabezado-altiplano.dto';
import { UpdateCubetasEncabezadoAltiplanoDto } from './dto/update-cubetas-encabezado-altiplano.dto';

@Injectable()
export class CubetasEncabezadoAltiplanoService {
  constructor(
    @InjectRepository(CubetasEncabezadoAltiplano)
    private readonly repository: Repository<CubetasEncabezadoAltiplano>,
  ) {}

  create(dto: CreateCubetasEncabezadoAltiplanoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasEncabezadoAltiplano ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasEncabezadoAltiplanoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
