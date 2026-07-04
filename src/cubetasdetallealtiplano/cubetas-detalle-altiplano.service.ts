import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasDetalleAltiplano } from './entities/cubetas-detalle-altiplano.entity';
import { CreateCubetasDetalleAltiplanoDto } from './dto/create-cubetas-detalle-altiplano.dto';
import { UpdateCubetasDetalleAltiplanoDto } from './dto/update-cubetas-detalle-altiplano.dto';

@Injectable()
export class CubetasDetalleAltiplanoService {
  constructor(
    @InjectRepository(CubetasDetalleAltiplano)
    private readonly repository: Repository<CubetasDetalleAltiplano>,
  ) {}

  create(dto: CreateCubetasDetalleAltiplanoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasDetalleAltiplano ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasDetalleAltiplanoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
