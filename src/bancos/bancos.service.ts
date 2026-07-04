import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banco } from './entities/banco.entity';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';

@Injectable()
export class BancosService {
  constructor(
    @InjectRepository(Banco)
    private readonly bancoRepository: Repository<Banco>,
  ) {}

  create(dto: CreateBancoDto) {
    const banco = this.bancoRepository.create(dto);
    return this.bancoRepository.save(banco);
  }

  findAll() {
    return this.bancoRepository.find();
  }

  async findOne(id: number) {
    const banco = await this.bancoRepository.findOneBy({ idBanco: id });
    if (!banco) throw new NotFoundException(`Banco ${id} no encontrado`);
    return banco;
  }

  async update(id: number, dto: UpdateBancoDto) {
    await this.findOne(id);
    await this.bancoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const banco = await this.findOne(id);
    return this.bancoRepository.remove(banco);
  }
}
