import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DerivadosAlmacenDetalle } from './entities/derivados-almacen-detalle.entity';
import { CreateDerivadosAlmacenDetalleDto } from './dto/create-derivados-almacen-detalle.dto';
import { UpdateDerivadosAlmacenDetalleDto } from './dto/update-derivados-almacen-detalle.dto';

@Injectable()
export class DerivadosAlmacenDetalleService {
  constructor(
    @InjectRepository(DerivadosAlmacenDetalle)
    private readonly derivadosAlmacenDetalleRepository: Repository<DerivadosAlmacenDetalle>,
  ) {}

  create(createDerivadosAlmacenDetalleDto: CreateDerivadosAlmacenDetalleDto) {
    const record = this.derivadosAlmacenDetalleRepository.create(createDerivadosAlmacenDetalleDto);
    return this.derivadosAlmacenDetalleRepository.save(record);
  }

  findAll() {
    return this.derivadosAlmacenDetalleRepository.find({ order: { idProductoDerivado: 'DESC' } });
  }

  async findOne(id: number) {
    const record = await this.derivadosAlmacenDetalleRepository.findOneBy({ idProductoDerivado: id });
    if (!record) {
      throw new NotFoundException(`DerivadosAlmacenDetalle #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateDerivadosAlmacenDetalleDto: UpdateDerivadosAlmacenDetalleDto) {
    await this.findOne(id);
    await this.derivadosAlmacenDetalleRepository.update(id, updateDerivadosAlmacenDetalleDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.derivadosAlmacenDetalleRepository.remove(record);
  }
}
