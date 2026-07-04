import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasDetalleAguacate } from './entities/cubetas-detalle-aguacate.entity';
import { CreateCubetasDetalleAguacateDto } from './dto/create-cubetas-detalle-aguacate.dto';
import { UpdateCubetasDetalleAguacateDto } from './dto/update-cubetas-detalle-aguacate.dto';

@Injectable()
export class CubetasDetalleAguacateService {
  constructor(
    @InjectRepository(CubetasDetalleAguacate)
    private readonly repository: Repository<CubetasDetalleAguacate>,
  ) {}

  create(dto: CreateCubetasDetalleAguacateDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasDetalleAguacate ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasDetalleAguacateDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
