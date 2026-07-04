import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasEncabezado } from './entities/cubetas-encabezado.entity';
import { CreateCubetasEncabezadoDto } from './dto/create-cubetas-encabezado.dto';
import { UpdateCubetasEncabezadoDto } from './dto/update-cubetas-encabezado.dto';

@Injectable()
export class CubetasEncabezadoService {
  constructor(
    @InjectRepository(CubetasEncabezado)
    private readonly repository: Repository<CubetasEncabezado>,
  ) {}

  create(dto: CreateCubetasEncabezadoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasEncabezado ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasEncabezadoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
