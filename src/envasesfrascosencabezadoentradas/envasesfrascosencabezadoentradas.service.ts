import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvasesFrascosEncabezadoEntradas } from './entities/envases-frascos-encabezado-entradas.entity';
import { CreateEnvasesFrascosEncabezadoEntradasDto } from './dto/create-envases-frascos-encabezado-entradas.dto';
import { UpdateEnvasesFrascosEncabezadoEntradasDto } from './dto/update-envases-frascos-encabezado-entradas.dto';

@Injectable()
export class EnvasesFrascosEncabezadoEntradasService {
  constructor(
    @InjectRepository(EnvasesFrascosEncabezadoEntradas)
    private readonly envasesFrascosEncabezadoEntradasRepository: Repository<EnvasesFrascosEncabezadoEntradas>,
  ) {}

  create(createEnvasesFrascosEncabezadoEntradasDto: CreateEnvasesFrascosEncabezadoEntradasDto) {
    const record = this.envasesFrascosEncabezadoEntradasRepository.create(createEnvasesFrascosEncabezadoEntradasDto);
    return this.envasesFrascosEncabezadoEntradasRepository.save(record);
  }

  findAll() {
    return this.envasesFrascosEncabezadoEntradasRepository.find();
  }

  async findOne(id: number) {
    const record = await this.envasesFrascosEncabezadoEntradasRepository.findOneBy({ idEntradaEnvases: id });
    if (!record) {
      throw new NotFoundException(`EnvasesFrascosEncabezadoEntradas #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateEnvasesFrascosEncabezadoEntradasDto: UpdateEnvasesFrascosEncabezadoEntradasDto) {
    await this.findOne(id);
    await this.envasesFrascosEncabezadoEntradasRepository.update(id, updateEnvasesFrascosEncabezadoEntradasDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.envasesFrascosEncabezadoEntradasRepository.remove(record);
  }
}
