import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteExportador } from './entities/cliente-exportador.entity';
import { CreateClienteExportadorDto } from './dto/create-cliente-exportador.dto';
import { UpdateClienteExportadorDto } from './dto/update-cliente-exportador.dto';

@Injectable()
export class ClientesExportadoresService {
  constructor(
    @InjectRepository(ClienteExportador)
    private readonly clienteExportadorRepository: Repository<ClienteExportador>,
  ) {}

  create(dto: CreateClienteExportadorDto) {
    const clienteExportador = this.clienteExportadorRepository.create(dto);
    return this.clienteExportadorRepository.save(clienteExportador);
  }

  findAll() {
    return this.clienteExportadorRepository.find();
  }

  async findOne(id: number) {
    const clienteExportador = await this.clienteExportadorRepository.findOneBy({ idClienteExportador: id });
    if (!clienteExportador) throw new NotFoundException(`ClienteExportador ${id} no encontrado`);
    return clienteExportador;
  }

  async update(id: number, dto: UpdateClienteExportadorDto) {
    await this.findOne(id);
    await this.clienteExportadorRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const clienteExportador = await this.findOne(id);
    return this.clienteExportadorRepository.remove(clienteExportador);
  }
}
