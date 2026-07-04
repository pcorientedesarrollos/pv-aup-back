import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenAguacate } from './entities/almacen-aguacate.entity';
import { CreateAlmacenAguacateDto } from './dto/create-almacen-aguacate.dto';
import { UpdateAlmacenAguacateDto } from './dto/update-almacen-aguacate.dto';

@Injectable()
export class AlmacenAguacateService {
  constructor(
    @InjectRepository(AlmacenAguacate)
    private readonly repository: Repository<AlmacenAguacate>,
  ) {}

  create(dto: CreateAlmacenAguacateDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenAguacate ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenAguacateDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
