import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosCliente } from '../pos/entities/pos-cliente.entity';
import { PosVenta } from '../pos/entities/pos-venta.entity';
import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PosCliente) private clienteRepo: Repository<PosCliente>,
    @InjectRepository(PosVenta) private ventaRepo: Repository<PosVenta>,
    @InjectRepository(PosVentaDetalle) private ventaDetalleRepo: Repository<PosVentaDetalle>
  ) {}

  async getResumen() {
    try {
      const totalClientes = await this.clienteRepo.count();

      const hoy = new Date();
      const tzOffset = hoy.getTimezoneOffset() * 60000;
      const localDate = new Date(hoy.getTime() - tzOffset);
      const fechaStr = localDate.toISOString().slice(0, 10);

      // Ventas de hoy sumando el total_pagado de PosVenta
      const resultVentasHoy = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) = :fechaStr', { fechaStr })
        .andWhere("venta.estatus = 'Completada'")
        .select('SUM(venta.total_pagado)', 'total')
        .getRawOne();
        
      const ventasHoy = resultVentasHoy?.total ? Number(resultVentasHoy.total) : 0;

      // Movimientos hoy (conteo de items vendidos hoy)
      const resultMovimientosHoy = await this.ventaDetalleRepo.createQueryBuilder('detalle')
        .innerJoin('detalle.venta', 'venta')
        .where('DATE(venta.fecha_venta) = :fechaStr', { fechaStr })
        .andWhere("venta.estatus = 'Completada'")
        .getCount();

      // ltimos movimientos
      const ultimosMovimientos = await this.ventaDetalleRepo.find({
        order: { idDetalle: 'DESC' },
        take: 5,
        relations: { producto: true, venta: true }
      });

      // Ventas semanales (Lunes a Domingo de la semana actual)
      const dayOfWeek = localDate.getDay() || 7; // 1 (Lunes) a 7 (Domingo)
      const monday = new Date(localDate);
      monday.setDate(localDate.getDate() - dayOfWeek + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const mondayStr = monday.toISOString().slice(0, 10);
      const sundayStr = sunday.toISOString().slice(0, 10);

      const ventasSemanalesResult = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) BETWEEN :mondayStr AND :sundayStr', { mondayStr, sundayStr })
        .andWhere("venta.estatus = 'Completada'")
        .select('DATE(venta.fecha_venta)', 'fecha')
        .addSelect('SUM(venta.total_pagado)', 'total')
        .groupBy('DATE(venta.fecha_venta)')
        .getRawMany();

      const ventasSemana = [0, 0, 0, 0, 0, 0, 0];
      for (const v of ventasSemanalesResult) {
        const fechaObj = new Date(v.fecha);
        const dia = fechaObj.getDay() || 7;
        ventasSemana[dia - 1] = Number(v.total);
      }

      // Top 5 productos ms vendidos del mes
      const startOfMonth = new Date(localDate.getFullYear(), localDate.getMonth(), 1).toISOString().slice(0, 10);
      const endOfMonth = new Date(localDate.getFullYear(), localDate.getMonth() + 1, 0).toISOString().slice(0, 10);

      const topProductos = await this.ventaDetalleRepo.createQueryBuilder('detalle')
        .innerJoin('detalle.venta', 'venta')
        .innerJoin('detalle.producto', 'producto')
        .where('DATE(venta.fecha_venta) BETWEEN :startOfMonth AND :endOfMonth', { startOfMonth, endOfMonth })
        .andWhere("venta.estatus = 'Completada'")
        .select('producto.nombre', 'nombre')
        .addSelect('SUM(detalle.cantidad)', 'cantidad')
        .groupBy('producto.nombre')
        .orderBy('SUM(detalle.cantidad)', 'DESC')
        .limit(5)
        .getRawMany();

      return {
        ventasHoy,
        totalClientes,
        movimientosHoy: resultMovimientosHoy,
        ultimosMovimientos: ultimosMovimientos.map(m => ({
          idDetalle: m.idDetalle,
          concepto: m.producto?.nombre || 'Producto Desconocido',
          cantidad: m.cantidad,
          precio: m.precioUnitario,
          importe: m.subtotal
        })),
        ventasSemana,
        topProductos
      };
    } catch (error) {
      console.error('Error en dashboard.service.ts -> getResumen:', error);
      throw error;
    }
  }
}
