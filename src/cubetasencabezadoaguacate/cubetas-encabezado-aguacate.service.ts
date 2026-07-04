import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasEncabezadoAguacate } from './entities/cubetas-encabezado-aguacate.entity';
import { CreateCubetasEncabezadoAguacateDto } from './dto/create-cubetas-encabezado-aguacate.dto';
import { UpdateCubetasEncabezadoAguacateDto } from './dto/update-cubetas-encabezado-aguacate.dto';

@Injectable()
export class CubetasEncabezadoAguacateService {
  constructor(
    @InjectRepository(CubetasEncabezadoAguacate)
    private readonly repository: Repository<CubetasEncabezadoAguacate>,
  ) {}

  create(dto: CreateCubetasEncabezadoAguacateDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasEncabezadoAguacate ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasEncabezadoAguacateDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
