import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenNaranjo } from './entities/almacen-naranjo.entity';
import { CreateAlmacenNaranjoDto } from './dto/create-almacen-naranjo.dto';
import { UpdateAlmacenNaranjoDto } from './dto/update-almacen-naranjo.dto';

@Injectable()
export class AlmacenNaranjoService {
  constructor(
    @InjectRepository(AlmacenNaranjo)
    private readonly repository: Repository<AlmacenNaranjo>,
  ) {}

  create(dto: CreateAlmacenNaranjoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenNaranjo ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenNaranjoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
