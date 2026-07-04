import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvasesFrascosEncabezadoSalidas } from './entities/envases-frascos-encabezado-salidas.entity';
import { CreateEnvasesFrascosEncabezadoSalidasDto } from './dto/create-envases-frascos-encabezado-salidas.dto';
import { UpdateEnvasesFrascosEncabezadoSalidasDto } from './dto/update-envases-frascos-encabezado-salidas.dto';

@Injectable()
export class EnvasesFrascosEncabezadoSalidasService {
  constructor(
    @InjectRepository(EnvasesFrascosEncabezadoSalidas)
    private readonly envasesFrascosEncabezadoSalidasRepository: Repository<EnvasesFrascosEncabezadoSalidas>,
  ) {}

  create(createEnvasesFrascosEncabezadoSalidasDto: CreateEnvasesFrascosEncabezadoSalidasDto) {
    const record = this.envasesFrascosEncabezadoSalidasRepository.create(createEnvasesFrascosEncabezadoSalidasDto);
    return this.envasesFrascosEncabezadoSalidasRepository.save(record);
  }

  findAll() {
    return this.envasesFrascosEncabezadoSalidasRepository.find();
  }

  async findOne(id: number) {
    const record = await this.envasesFrascosEncabezadoSalidasRepository.findOneBy({ idSalidaEnvases: id });
    if (!record) {
      throw new NotFoundException(`EnvasesFrascosEncabezadoSalidas #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateEnvasesFrascosEncabezadoSalidasDto: UpdateEnvasesFrascosEncabezadoSalidasDto) {
    await this.findOne(id);
    await this.envasesFrascosEncabezadoSalidasRepository.update(id, updateEnvasesFrascosEncabezadoSalidasDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.envasesFrascosEncabezadoSalidasRepository.remove(record);
  }
}
