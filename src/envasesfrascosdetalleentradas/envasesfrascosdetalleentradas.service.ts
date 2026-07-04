import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvasesFrascosDetalleEntradas } from './entities/envases-frascos-detalle-entradas.entity';
import { CreateEnvasesFrascosDetalleEntradasDto } from './dto/create-envases-frascos-detalle-entradas.dto';
import { UpdateEnvasesFrascosDetalleEntradasDto } from './dto/update-envases-frascos-detalle-entradas.dto';

@Injectable()
export class EnvasesFrascosDetalleEntradasService {
  constructor(
    @InjectRepository(EnvasesFrascosDetalleEntradas)
    private readonly envasesFrascosDetalleEntradasRepository: Repository<EnvasesFrascosDetalleEntradas>,
  ) {}

  create(createEnvasesFrascosDetalleEntradasDto: CreateEnvasesFrascosDetalleEntradasDto) {
    const record = this.envasesFrascosDetalleEntradasRepository.create(createEnvasesFrascosDetalleEntradasDto);
    return this.envasesFrascosDetalleEntradasRepository.save(record);
  }

  findAll() {
    return this.envasesFrascosDetalleEntradasRepository.find({ order: { idDetalleEntrada: 'DESC' } });
  }

  async findOne(id: number) {
    const record = await this.envasesFrascosDetalleEntradasRepository.findOneBy({ idDetalleEntrada: id });
    if (!record) {
      throw new NotFoundException(`EnvasesFrascosDetalleEntradas #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateEnvasesFrascosDetalleEntradasDto: UpdateEnvasesFrascosDetalleEntradasDto) {
    await this.findOne(id);
    await this.envasesFrascosDetalleEntradasRepository.update(id, updateEnvasesFrascosDetalleEntradasDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.envasesFrascosDetalleEntradasRepository.remove(record);
  }
}
