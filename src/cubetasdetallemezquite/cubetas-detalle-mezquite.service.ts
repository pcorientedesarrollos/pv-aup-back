import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CubetasDetalleMezquite } from './entities/cubetas-detalle-mezquite.entity';
import { CreateCubetasDetalleMezquiteDto } from './dto/create-cubetas-detalle-mezquite.dto';
import { UpdateCubetasDetalleMezquiteDto } from './dto/update-cubetas-detalle-mezquite.dto';

@Injectable()
export class CubetasDetalleMezquiteService {
  constructor(
    @InjectRepository(CubetasDetalleMezquite)
    private readonly repository: Repository<CubetasDetalleMezquite>,
  ) {}

  create(dto: CreateCubetasDetalleMezquiteDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`CubetasDetalleMezquite ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateCubetasDetalleMezquiteDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
