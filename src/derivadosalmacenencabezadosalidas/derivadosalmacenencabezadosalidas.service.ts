import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DerivadosAlmacenEncabezadoSalidas } from './entities/derivados-almacen-encabezado-salidas.entity';
import { CreateDerivadosAlmacenEncabezadoSalidasDto } from './dto/create-derivados-almacen-encabezado-salidas.dto';
import { UpdateDerivadosAlmacenEncabezadoSalidasDto } from './dto/update-derivados-almacen-encabezado-salidas.dto';

@Injectable()
export class DerivadosAlmacenEncabezadoSalidasService {
  constructor(
    @InjectRepository(DerivadosAlmacenEncabezadoSalidas)
    private readonly derivadosAlmacenEncabezadoSalidasRepository: Repository<DerivadosAlmacenEncabezadoSalidas>,
  ) {}

  create(createDerivadosAlmacenEncabezadoSalidasDto: CreateDerivadosAlmacenEncabezadoSalidasDto) {
    const record = this.derivadosAlmacenEncabezadoSalidasRepository.create(createDerivadosAlmacenEncabezadoSalidasDto);
    return this.derivadosAlmacenEncabezadoSalidasRepository.save(record);
  }

  findAll() {
    return this.derivadosAlmacenEncabezadoSalidasRepository.find();
  }

  async findOne(id: number) {
    const record = await this.derivadosAlmacenEncabezadoSalidasRepository.findOneBy({ idSalida: id });
    if (!record) {
      throw new NotFoundException(`DerivadosAlmacenEncabezadoSalidas #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateDerivadosAlmacenEncabezadoSalidasDto: UpdateDerivadosAlmacenEncabezadoSalidasDto) {
    await this.findOne(id);
    await this.derivadosAlmacenEncabezadoSalidasRepository.update(id, updateDerivadosAlmacenEncabezadoSalidasDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.derivadosAlmacenEncabezadoSalidasRepository.remove(record);
  }
}
