import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  create(dto: CreateProveedorDto) {
    const proveedor = this.proveedorRepository.create(dto);
    return this.proveedorRepository.save(proveedor);
  }

  findAll() {
    return this.proveedorRepository.find();
  }

  async findOne(id: number) {
    const proveedor = await this.proveedorRepository.findOneBy({ idProveedor: id });
    if (!proveedor) throw new NotFoundException(`Proveedor ${id} no encontrado`);
    return proveedor;
  }

  async update(id: number, dto: UpdateProveedorDto) {
    await this.findOne(id);
    await this.proveedorRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const proveedor = await this.findOne(id);
    return this.proveedorRepository.remove(proveedor);
  }
}
