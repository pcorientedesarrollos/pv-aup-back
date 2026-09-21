import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosCliente } from '../pos/entities/pos-cliente.entity';
import { PosVenta } from '../pos/entities/pos-venta.entity';
import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';
import { PosProducto } from '../pos/entities/pos-producto.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PosCliente) private clienteRepo: Repository<PosCliente>,
    @InjectRepository(PosVenta) private ventaRepo: Repository<PosVenta>,
    @InjectRepository(PosVentaDetalle) private ventaDetalleRepo: Repository<PosVentaDetalle>,
    @InjectRepository(PosProducto) private productoRepo: Repository<PosProducto>
  ) {}

  async getResumen() {
    try {
      const hoy = new Date();
      const tzOffset = hoy.getTimezoneOffset() * 60000;
      const localDate = new Date(hoy.getTime() - tzOffset);
      const fechaStr = localDate.toISOString().slice(0, 10);

      // --- 1. VENTAS HOY ---
      const ventasHoyResult = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) = :fechaStr', { fechaStr })
        .andWhere("venta.estatus = 'Completada'")
        .select('SUM(venta.total_pagado)', 'total')
        .addSelect('COUNT(venta.id_venta)', 'tickets')
        .getRawOne();
        
      const ventasHoy = Number(ventasHoyResult?.total || 0);
      const ticketsHoy = Number(ventasHoyResult?.tickets || 0);

      // --- 2. DEVOLUCIONES HOY ---
      const devolucionesHoyResult = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) = :fechaStr', { fechaStr })
        .andWhere("venta.estatus = 'Cancelada'")
        .select('SUM(venta.total_pagado)', 'total')
        .addSelect('COUNT(venta.id_venta)', 'tickets')
        .getRawOne();
      
      const devolucionesHoy = Number(devolucionesHoyResult?.total || 0);
      const ticketsDevolucionesHoy = Number(devolucionesHoyResult?.tickets || 0);

      // --- 3. ESTA SEMANA ---
      const dayOfWeek = localDate.getDay() || 7; 
      const monday = new Date(localDate);
      monday.setDate(localDate.getDate() - dayOfWeek + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const mondayStr = monday.toISOString().slice(0, 10);
      const sundayStr = sunday.toISOString().slice(0, 10);

      const ventasSemanalesTotales = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) BETWEEN :mondayStr AND :sundayStr', { mondayStr, sundayStr })
        .andWhere("venta.estatus = 'Completada'")
        .select('SUM(venta.total_pagado)', 'total')
        .addSelect('COUNT(venta.id_venta)', 'tickets')
        .getRawOne();

      const ventasSemanaTotal = Number(ventasSemanalesTotales?.total || 0);
      const ticketsSemana = Number(ventasSemanalesTotales?.tickets || 0);

      // (Data para la gráfica de la semana)
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

      // --- 4. ESTE MES ---
      const startOfMonth = new Date(localDate.getFullYear(), localDate.getMonth(), 1).toISOString().slice(0, 10);
      const endOfMonth = new Date(localDate.getFullYear(), localDate.getMonth() + 1, 0).toISOString().slice(0, 10);

      const ventasMesTotales = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) BETWEEN :startOfMonth AND :endOfMonth', { startOfMonth, endOfMonth })
        .andWhere("venta.estatus = 'Completada'")
        .select('SUM(venta.total_pagado)', 'total')
        .addSelect('COUNT(venta.id_venta)', 'tickets')
        .getRawOne();

      const ventasMes = Number(ventasMesTotales?.total || 0);
      const ticketsMes = Number(ventasMesTotales?.tickets || 0);

      // --- 5. SIN STOCK ---
      const sinStock = await this.productoRepo.createQueryBuilder('producto')
        .where('producto.stock <= 0')
        .getCount();

      // --- EXTRAS (Movimientos, etc) ---
      const ultimosMovimientos = await this.ventaDetalleRepo.find({
        order: { idDetalle: 'DESC' },
        take: 5,
        relations: { producto: true, venta: true }
      });

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
        ticketsHoy,
        devolucionesHoy,
        ticketsDevolucionesHoy,
        ventasSemanaTotal,
        ticketsSemana,
        ventasMes,
        ticketsMes,
        sinStock,
        ventasSemana, // para grafica
        ultimosMovimientos: ultimosMovimientos.map(m => ({
          idDetalle: m.idDetalle,
          concepto: m.producto?.nombre || 'Producto Desconocido',
          cantidad: m.cantidad,
          precio: m.precioUnitario,
          importe: m.subtotal,
          movimiento: m.venta?.estatus === 'Cancelada' ? 'SALIDA' : 'ENTRADA'
        })),
        topProductos
      };
    } catch (error) {
      console.error('Error en dashboard.service.ts -> getResumen:', error);
      throw error;
    }
  }
}
