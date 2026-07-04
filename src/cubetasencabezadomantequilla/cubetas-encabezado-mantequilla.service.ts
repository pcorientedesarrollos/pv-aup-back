import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasEncabezadoMantequilla } from './entities/cubetas-encabezado-mantequilla.entity';
import { CreateCubetasEncabezadoMantequillaDto } from './dto/create-cubetas-encabezado-mantequilla.dto';
import { UpdateCubetasEncabezadoMantequillaDto } from './dto/update-cubetas-encabezado-mantequilla.dto';

@Injectable()
export class CubetasEncabezadoMantequillaService {
  constructor(
    @InjectRepository(CubetasEncabezadoMantequilla)
    private readonly repository: Repository<CubetasEncabezadoMantequilla>,
  ) {}

  create(dto: CreateCubetasEncabezadoMantequillaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasEncabezadoMantequilla ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasEncabezadoMantequillaDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
