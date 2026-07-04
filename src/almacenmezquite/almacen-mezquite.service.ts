import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenMezquite } from './entities/almacen-mezquite.entity';
import { CreateAlmacenMezquiteDto } from './dto/create-almacen-mezquite.dto';
import { UpdateAlmacenMezquiteDto } from './dto/update-almacen-mezquite.dto';

@Injectable()
export class AlmacenMezquiteService {
  constructor(
    @InjectRepository(AlmacenMezquite)
    private readonly repository: Repository<AlmacenMezquite>,
  ) {}

  create(dto: CreateAlmacenMezquiteDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenMezquite ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenMezquiteDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
