import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DerivadosAlmacenEncabezado } from './entities/derivados-almacen-encabezado.entity';
import { CreateDerivadosAlmacenEncabezadoDto } from './dto/create-derivados-almacen-encabezado.dto';
import { UpdateDerivadosAlmacenEncabezadoDto } from './dto/update-derivados-almacen-encabezado.dto';

@Injectable()
export class DerivadosAlmacenEncabezadoService {
  constructor(
    @InjectRepository(DerivadosAlmacenEncabezado)
    private readonly derivadosAlmacenEncabezadoRepository: Repository<DerivadosAlmacenEncabezado>,
  ) {}

  create(createDerivadosAlmacenEncabezadoDto: CreateDerivadosAlmacenEncabezadoDto) {
    const record = this.derivadosAlmacenEncabezadoRepository.create(createDerivadosAlmacenEncabezadoDto);
    return this.derivadosAlmacenEncabezadoRepository.save(record);
  }

  findAll() {
    return this.derivadosAlmacenEncabezadoRepository.find();
  }

  async findOne(id: number) {
    const record = await this.derivadosAlmacenEncabezadoRepository.findOneBy({ idEntrada: id });
    if (!record) {
      throw new NotFoundException(`DerivadosAlmacenEncabezado #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateDerivadosAlmacenEncabezadoDto: UpdateDerivadosAlmacenEncabezadoDto) {
    await this.findOne(id);
    await this.derivadosAlmacenEncabezadoRepository.update(id, updateDerivadosAlmacenEncabezadoDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.derivadosAlmacenEncabezadoRepository.remove(record);
  }
}
