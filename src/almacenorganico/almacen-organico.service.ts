import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlmacenOrganico } from './entities/almacen-organico.entity';
import { CreateAlmacenOrganicoDto } from './dto/create-almacen-organico.dto';
import { UpdateAlmacenOrganicoDto } from './dto/update-almacen-organico.dto';

@Injectable()
export class AlmacenOrganicoService {
  constructor(
    @InjectRepository(AlmacenOrganico)
    private readonly repository: Repository<AlmacenOrganico>,
  ) {}

  create(dto: CreateAlmacenOrganicoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idAlmacen: id });
    if (!record) throw new NotFoundException(`AlmacenOrganico ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateAlmacenOrganicoDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
