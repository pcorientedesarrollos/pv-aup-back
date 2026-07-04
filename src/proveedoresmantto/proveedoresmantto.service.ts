import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorMantto } from './entities/proveedor-mantto.entity';
import { CreateProveedorManttoDto } from './dto/create-proveedor-mantto.dto';
import { UpdateProveedorManttoDto } from './dto/update-proveedor-mantto.dto';

@Injectable()
export class ProveedoresManttoService {
  constructor(
    @InjectRepository(ProveedorMantto)
    private readonly proveedorManttoRepository: Repository<ProveedorMantto>,
  ) {}

  create(dto: CreateProveedorManttoDto) {
    const proveedorMantto = this.proveedorManttoRepository.create(dto);
    return this.proveedorManttoRepository.save(proveedorMantto);
  }

  findAll() {
    return this.proveedorManttoRepository.find();
  }

  async findOne(id: number) {
    const proveedorMantto = await this.proveedorManttoRepository.findOneBy({ idProveedorMantto: id });
    if (!proveedorMantto) throw new NotFoundException(`ProveedorMantto ${id} no encontrado`);
    return proveedorMantto;
  }

  async update(id: number, dto: UpdateProveedorManttoDto) {
    await this.findOne(id);
    await this.proveedorManttoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const proveedorMantto = await this.findOne(id);
    return this.proveedorManttoRepository.remove(proveedorMantto);
  }
}
