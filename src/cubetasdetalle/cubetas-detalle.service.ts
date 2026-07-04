import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasDetalle } from './entities/cubetas-detalle.entity';
import { CreateCubetasDetalleDto } from './dto/create-cubetas-detalle.dto';
import { UpdateCubetasDetalleDto } from './dto/update-cubetas-detalle.dto';

@Injectable()
export class CubetasDetalleService {
  constructor(
    @InjectRepository(CubetasDetalle)
    private readonly repository: Repository<CubetasDetalle>,
  ) {}

  create(dto: CreateCubetasDetalleDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasDetalle ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasDetalleDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
