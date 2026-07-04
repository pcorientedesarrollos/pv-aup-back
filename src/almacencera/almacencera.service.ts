import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenCera } from './entities/almacen-cera.entity';
import { CreateAlmacenCeraDto } from './dto/create-almacen-cera.dto';
import { UpdateAlmacenCeraDto } from './dto/update-almacen-cera.dto';

@Injectable()
export class AlmacenCeraService {
  constructor(
    @InjectRepository(AlmacenCera)
    private readonly almacenCeraRepository: Repository<AlmacenCera>,
  ) {}

  create(dto: CreateAlmacenCeraDto) {
    const almacen = this.almacenCeraRepository.create(dto);
    return this.almacenCeraRepository.save(almacen);
  }

  findAll() {
    return this.almacenCeraRepository.find({ order: { idAlmacen: 'DESC' } });
  }

  async findOne(id: number) {
    const almacen = await this.almacenCeraRepository.findOneBy({ idAlmacen: id });
    if (!almacen) throw new NotFoundException(`AlmacenCera ${id} no encontrado`);
    return almacen;
  }

  async update(id: number, dto: UpdateAlmacenCeraDto) {
    await this.findOne(id);
    await this.almacenCeraRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const almacen = await this.findOne(id);
    return this.almacenCeraRepository.remove(almacen);
  }
}
