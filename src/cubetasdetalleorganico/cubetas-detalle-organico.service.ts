import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasDetalleOrganico } from './entities/cubetas-detalle-organico.entity';
import { CreateCubetasDetalleOrganicoDto } from './dto/create-cubetas-detalle-organico.dto';
import { UpdateCubetasDetalleOrganicoDto } from './dto/update-cubetas-detalle-organico.dto';

@Injectable()
export class CubetasDetalleOrganicoService {
  constructor(
    @InjectRepository(CubetasDetalleOrganico)
    private readonly repository: Repository<CubetasDetalleOrganico>,
  ) {}

  create(dto: CreateCubetasDetalleOrganicoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasDetalleOrganico ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasDetalleOrganicoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
