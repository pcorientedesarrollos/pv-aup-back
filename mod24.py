# -*- coding: utf-8 -*-
import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''  async getGastos(idSucursal: number) {
    if (!idSucursal) return [];
    return this.gastoRepo.find({
      where: { sucursal: { idSucursal } },
      relations: { usuario: true, corte: true },
      order: { fecha: 'DESC' }, take: 200
    });
  }'''

new_method = '''  async getGastos(idSucursal: number, desde?: string, hasta?: string) {
    if (!idSucursal) return [];
    const query = this.gastoRepo.createQueryBuilder('gasto')
      .leftJoinAndSelect('gasto.usuario', 'usuario')
      .leftJoinAndSelect('gasto.corte', 'corte')
      .leftJoinAndSelect('gasto.categoria', 'categoria')
      .where('gasto.id_sucursal = :idSucursal', { idSucursal });

    if (desde) {
      query.andWhere('DATE(gasto.fecha) >= :desde', { desde });
    }
    if (hasta) {
      query.andWhere('DATE(gasto.fecha) <= :hasta', { hasta });
    }

    return query.orderBy('gasto.fecha', 'DESC').take(200).getMany();
  }'''

text = text.replace(target, new_method)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
