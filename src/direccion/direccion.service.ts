import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direccion } from './entities/direccion.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';

@Injectable()
export class DireccionService {
  constructor(
    @InjectRepository(Direccion)
    private readonly direccionRepository: Repository<Direccion>,
  ) {}

  create(dto: CreateDireccionDto) {
    const direccion = this.direccionRepository.create(dto);
    return this.direccionRepository.save(direccion);
  }

  findAll() {
    return this.direccionRepository.find();
  }

  async findOne(id: number) {
    const direccion = await this.direccionRepository.findOneBy({ idDireccion: id });
    if (!direccion) throw new NotFoundException(`Direccion ${id} no encontrada`);
    return direccion;
  }

  async update(id: number, dto: UpdateDireccionDto) {
    await this.findOne(id);
    await this.direccionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const direccion = await this.findOne(id);
    return this.direccionRepository.remove(direccion);
  }
}
