import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenAltiplano } from './entities/almacen-altiplano.entity';
import { CreateAlmacenAltiplanoDto } from './dto/create-almacen-altiplano.dto';
import { UpdateAlmacenAltiplanoDto } from './dto/update-almacen-altiplano.dto';

@Injectable()
export class AlmacenAltiplanoService {
  constructor(
    @InjectRepository(AlmacenAltiplano)
    private readonly repository: Repository<AlmacenAltiplano>,
  ) {}

  create(dto: CreateAlmacenAltiplanoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenAltiplano ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenAltiplanoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
