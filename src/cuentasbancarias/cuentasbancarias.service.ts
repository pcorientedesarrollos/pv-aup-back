import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaBancaria } from './entities/cuenta-bancaria.entity';
import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';

@Injectable()
export class CuentasBancariasService {
  constructor(
    @InjectRepository(CuentaBancaria)
    private readonly cuentaBancariaRepository: Repository<CuentaBancaria>,
  ) {}

  create(dto: CreateCuentaBancariaDto) {
    const cuentaBancaria = this.cuentaBancariaRepository.create(dto);
    return this.cuentaBancariaRepository.save(cuentaBancaria);
  }

  findAll() {
    return this.cuentaBancariaRepository.find();
  }

  async findOne(id: number) {
    const cuentaBancaria = await this.cuentaBancariaRepository.findOneBy({ idCuenta: id });
    if (!cuentaBancaria) throw new NotFoundException(`CuentaBancaria ${id} no encontrada`);
    return cuentaBancaria;
  }

  async update(id: number, dto: UpdateCuentaBancariaDto) {
    await this.findOne(id);
    await this.cuentaBancariaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const cuentaBancaria = await this.findOne(id);
    return this.cuentaBancariaRepository.remove(cuentaBancaria);
  }
}
