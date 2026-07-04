import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelacionMovimiento } from './entities/relacion-movimiento.entity';
import { CreateRelacionMovimientoDto } from './dto/create-relacion-movimiento.dto';
import { UpdateRelacionMovimientoDto } from './dto/update-relacion-movimiento.dto';

@Injectable()
export class RelacionDeMovimientosService {
  constructor(
    @InjectRepository(RelacionMovimiento)
    private readonly relacionRepository: Repository<RelacionMovimiento>,
  ) {}

  create(dto: CreateRelacionMovimientoDto) {
    const relacion = this.relacionRepository.create(dto);
    return this.relacionRepository.save(relacion);
  }

  findAll() {
    return this.relacionRepository.find();
  }

  async findOne(id: number) {
    const relacion = await this.relacionRepository.findOneBy({ id });
    if (!relacion) throw new NotFoundException(`RelacionMovimiento ${id} no encontrada`);
    return relacion;
  }

  async update(id: number, dto: UpdateRelacionMovimientoDto) {
    await this.findOne(id);
    await this.relacionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const relacion = await this.findOne(id);
    return this.relacionRepository.remove(relacion);
  }
}
