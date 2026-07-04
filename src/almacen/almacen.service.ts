import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Almacen } from './entities/almacen.entity';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';

@Injectable()
export class AlmacenService {
  constructor(
    @InjectRepository(Almacen)
    private readonly almacenRepository: Repository<Almacen>,
  ) {}

  create(dto: CreateAlmacenDto) {
    const record = this.almacenRepository.create(dto);
    return this.almacenRepository.save(record);
  }

  findAll() {
    return this.almacenRepository.find();
  }

  async findOne(id: number) {
    const record = await this.almacenRepository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`Almacen ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenDto) {
    await this.findOne(id);
    await this.almacenRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.almacenRepository.remove(record);
  }
}
