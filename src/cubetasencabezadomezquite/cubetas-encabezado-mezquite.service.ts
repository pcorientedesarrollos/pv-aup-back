import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasEncabezadoMezquite } from './entities/cubetas-encabezado-mezquite.entity';
import { CreateCubetasEncabezadoMezquiteDto } from './dto/create-cubetas-encabezado-mezquite.dto';
import { UpdateCubetasEncabezadoMezquiteDto } from './dto/update-cubetas-encabezado-mezquite.dto';

@Injectable()
export class CubetasEncabezadoMezquiteService {
  constructor(
    @InjectRepository(CubetasEncabezadoMezquite)
    private readonly repository: Repository<CubetasEncabezadoMezquite>,
  ) {}

  create(dto: CreateCubetasEncabezadoMezquiteDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasEncabezadoMezquite ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasEncabezadoMezquiteDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
