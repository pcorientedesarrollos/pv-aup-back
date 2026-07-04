import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvasesFrascosDetalleSalidas } from './entities/envases-frascos-detalle-salidas.entity';
import { CreateEnvasesFrascosDetalleSalidasDto } from './dto/create-envases-frascos-detalle-salidas.dto';
import { UpdateEnvasesFrascosDetalleSalidasDto } from './dto/update-envases-frascos-detalle-salidas.dto';

@Injectable()
export class EnvasesFrascosDetalleSalidasService {
  constructor(
    @InjectRepository(EnvasesFrascosDetalleSalidas)
    private readonly envasesFrascosDetalleSalidasRepository: Repository<EnvasesFrascosDetalleSalidas>,
  ) {}

  create(createEnvasesFrascosDetalleSalidasDto: CreateEnvasesFrascosDetalleSalidasDto) {
    const record = this.envasesFrascosDetalleSalidasRepository.create(createEnvasesFrascosDetalleSalidasDto);
    return this.envasesFrascosDetalleSalidasRepository.save(record);
  }

  findAll() {
    return this.envasesFrascosDetalleSalidasRepository.find();
  }

  async findOne(id: number) {
    const record = await this.envasesFrascosDetalleSalidasRepository.findOneBy({ idDetalleSalida: id });
    if (!record) {
      throw new NotFoundException(`EnvasesFrascosDetalleSalidas #${id} not found`);
    }
    return record;
  }

  async update(id: number, updateEnvasesFrascosDetalleSalidasDto: UpdateEnvasesFrascosDetalleSalidasDto) {
    await this.findOne(id);
    await this.envasesFrascosDetalleSalidasRepository.update(id, updateEnvasesFrascosDetalleSalidasDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.envasesFrascosDetalleSalidasRepository.remove(record);
  }
}
