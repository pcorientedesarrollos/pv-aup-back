import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasEncabezadoOrganico } from './entities/cubetas-encabezado-organico.entity';
import { CreateCubetasEncabezadoOrganicoDto } from './dto/create-cubetas-encabezado-organico.dto';
import { UpdateCubetasEncabezadoOrganicoDto } from './dto/update-cubetas-encabezado-organico.dto';

@Injectable()
export class CubetasEncabezadoOrganicoService {
  constructor(
    @InjectRepository(CubetasEncabezadoOrganico)
    private readonly repository: Repository<CubetasEncabezadoOrganico>,
  ) {}

  create(dto: CreateCubetasEncabezadoOrganicoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasEncabezadoOrganico ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasEncabezadoOrganicoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
