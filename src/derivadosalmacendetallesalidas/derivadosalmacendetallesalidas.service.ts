import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DerivadosAlmacenDetalleSalidas } from './entities/derivados-almacen-detalle-salidas.entity';
import { CreateDerivadosAlmacenDetalleSalidasDto } from './dto/create-derivados-almacen-detalle-salidas.dto';
import { UpdateDerivadosAlmacenDetalleSalidasDto } from './dto/update-derivados-almacen-detalle-salidas.dto';

@Injectable()
export class DerivadosAlmacenDetalleSalidasService {
  constructor(
    @InjectRepository(DerivadosAlmacenDetalleSalidas)
    private readonly derivadosAlmacenDetalleSalidasRepository: Repository<DerivadosAlmacenDetalleSalidas>,
  ) {}

  create(createDerivadosAlmacenDetalleSalidasDto: CreateDerivadosAlmacenDetalleSalidasDto) {
    const record = this.derivadosAlmacenDetalleSalidasRepository.create(createDerivadosAlmacenDetalleSalidasDto);
    return this.derivadosAlmacenDetalleSalidasRepository.save(record);
  }

  findAll() {
    return this.derivadosAlmacenDetalleSalidasRepository.find();
  }

  async findOne(id: number) {
    const record = await this.derivadosAlmacenDetalleSalidasRepository.findOneBy({ idProductoDerivado: id });
    if (!record) {
      throw new NotFoundException(`DerivadosAlmacenDetalleSalidas #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateDerivadosAlmacenDetalleSalidasDto: UpdateDerivadosAlmacenDetalleSalidasDto) {
    await this.findOne(id);
    await this.derivadosAlmacenDetalleSalidasRepository.update(id, updateDerivadosAlmacenDetalleSalidasDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.derivadosAlmacenDetalleSalidasRepository.remove(record);
  }
}
