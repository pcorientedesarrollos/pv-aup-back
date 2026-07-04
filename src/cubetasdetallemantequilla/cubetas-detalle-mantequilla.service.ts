import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasDetalleMantequilla } from './entities/cubetas-detalle-mantequilla.entity';
import { CreateCubetasDetalleMantequillaDto } from './dto/create-cubetas-detalle-mantequilla.dto';
import { UpdateCubetasDetalleMantequillaDto } from './dto/update-cubetas-detalle-mantequilla.dto';

@Injectable()
export class CubetasDetalleMantequillaService {
  constructor(
    @InjectRepository(CubetasDetalleMantequilla)
    private readonly repository: Repository<CubetasDetalleMantequilla>,
  ) {}

  create(dto: CreateCubetasDetalleMantequillaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasDetalleMantequilla ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasDetalleMantequillaDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
