import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenEncabezadoMezquite } from './entities/almacen-encabezado-mezquite.entity';
import { CreateAlmacenEncabezadoMezquiteDto } from './dto/create-almacen-encabezado-mezquite.dto';
import { UpdateAlmacenEncabezadoMezquiteDto } from './dto/update-almacen-encabezado-mezquite.dto';

@Injectable()
export class AlmacenEncabezadoMezquiteService {
  constructor(
    @InjectRepository(AlmacenEncabezadoMezquite)
    private readonly repository: Repository<AlmacenEncabezadoMezquite>,
  ) {}

  create(dto: CreateAlmacenEncabezadoMezquiteDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenEncabezadoMezquite ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenEncabezadoMezquiteDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
