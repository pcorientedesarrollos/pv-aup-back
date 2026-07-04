import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuxiliarBanco } from './entities/auxiliar-banco.entity';
import { CreateAuxiliarBancoDto } from './dto/create-auxiliar-banco.dto';
import { UpdateAuxiliarBancoDto } from './dto/update-auxiliar-banco.dto';

@Injectable()
export class AuxiliarDeBancosService {
  constructor(
    @InjectRepository(AuxiliarBanco)
    private readonly auxiliarRepository: Repository<AuxiliarBanco>,
  ) {}

  create(dto: CreateAuxiliarBancoDto) {
    const auxiliar = this.auxiliarRepository.create(dto);
    return this.auxiliarRepository.save(auxiliar);
  }

  findAll() {
    return this.auxiliarRepository.find();
  }

  async findOne(id: number) {
    const auxiliar = await this.auxiliarRepository.findOneBy({ idAuxiliar: id });
    if (!auxiliar) throw new NotFoundException(`AuxiliarBanco ${id} no encontrado`);
    return auxiliar;
  }

  async update(id: number, dto: UpdateAuxiliarBancoDto) {
    await this.findOne(id);
    await this.auxiliarRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const auxiliar = await this.findOne(id);
    return this.auxiliarRepository.remove(auxiliar);
  }
}
