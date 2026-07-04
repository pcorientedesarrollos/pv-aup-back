import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoCera } from './entities/almacen-encabezado-cera.entity';
import { CreateAlmacenEncabezadoCeraDto } from './dto/create-almacen-encabezado-cera.dto';
import { UpdateAlmacenEncabezadoCeraDto } from './dto/update-almacen-encabezado-cera.dto';

@Injectable()
export class AlmacenEncabezadoCeraService {
  constructor(
    @InjectRepository(AlmacenEncabezadoCera)
    private readonly almacenEncabezadoRepository: Repository<AlmacenEncabezadoCera>,
  ) {}

  create(dto: CreateAlmacenEncabezadoCeraDto) {
    const encabezado = this.almacenEncabezadoRepository.create(dto);
    return this.almacenEncabezadoRepository.save(encabezado);
  }

  findAll() {
    return this.almacenEncabezadoRepository.find();
  }

  async findOne(id: number) {
    const encabezado = await this.almacenEncabezadoRepository.findOneBy({ idAlmacen: id });
    if (!encabezado) throw new NotFoundException(`AlmacenEncabezadoCera ${id} no encontrado`);
    return encabezado;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoCeraDto) {
    await this.findOne(id);
    await this.almacenEncabezadoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const encabezado = await this.findOne(id);
    return this.almacenEncabezadoRepository.remove(encabezado);
  }
}
