import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenApicola } from './entities/almacen-apicola.entity';
import { CreateAlmacenApicolaDto } from './dto/create-almacen-apicola.dto';
import { UpdateAlmacenApicolaDto } from './dto/update-almacen-apicola.dto';

@Injectable()
export class AlmacenApicolaService {
  constructor(
    @InjectRepository(AlmacenApicola)
    private readonly almacenApicolaRepository: Repository<AlmacenApicola>,
  ) {}

  create(dto: CreateAlmacenApicolaDto) {
    const almacen = this.almacenApicolaRepository.create(dto);
    return this.almacenApicolaRepository.save(almacen);
  }

  findAll() {
    return this.almacenApicolaRepository.find({ order: { idAlmacen: 'DESC' } });
  }

  async findOne(id: number) {
    const almacen = await this.almacenApicolaRepository.findOneBy({ idAlmacen: id });
    if (!almacen) throw new NotFoundException(`AlmacenApicola ${id} no encontrado`);
    return almacen;
  }

  async update(id: number, dto: UpdateAlmacenApicolaDto) {
    await this.findOne(id);
    await this.almacenApicolaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const almacen = await this.findOne(id);
    return this.almacenApicolaRepository.remove(almacen);
  }
}
