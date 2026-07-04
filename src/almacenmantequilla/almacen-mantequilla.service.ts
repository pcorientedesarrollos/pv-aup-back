import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenMantequilla } from './entities/almacen-mantequilla.entity';
import { CreateAlmacenMantequillaDto } from './dto/create-almacen-mantequilla.dto';
import { UpdateAlmacenMantequillaDto } from './dto/update-almacen-mantequilla.dto';

@Injectable()
export class AlmacenMantequillaService {
  constructor(
    @InjectRepository(AlmacenMantequilla)
    private readonly repository: Repository<AlmacenMantequilla>,
  ) {}

  create(dto: CreateAlmacenMantequillaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenMantequilla ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenMantequillaDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
