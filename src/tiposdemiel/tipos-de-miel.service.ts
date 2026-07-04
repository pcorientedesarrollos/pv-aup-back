import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TiposDeMiel } from './entities/tipos-de-miel.entity';
import { CreateTiposDeMielDto } from './dto/create-tipos-de-miel.dto';
import { UpdateTiposDeMielDto } from './dto/update-tipos-de-miel.dto';

@Injectable()
export class TiposDeMielService {
  constructor(
    @InjectRepository(TiposDeMiel)
    private readonly repository: Repository<TiposDeMiel>,
  ) {}

  create(dto: CreateTiposDeMielDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const record = await this.repository.findOneBy({ idTipoDeMiel: id });
    if (!record) throw new NotFoundException(`TipoDeMiel ${id} no encontrado`);
    return record;
  }

  async update(id: number, dto: UpdateTiposDeMielDto) {
    await this.findOne(id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repository.remove(record);
  }
}
