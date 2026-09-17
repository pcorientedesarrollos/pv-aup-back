# -*- coding: utf-8 -*-
import re

with open('src/dashboard/dashboard.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

new_logic = '''  async getResumen() {
    try {
      const totalClientes = await this.clienteRepo.count();

      const hoy = new Date();
      const tzOffset = hoy.getTimezoneOffset() * 60000;
      const localDate = new Date(hoy.getTime() - tzOffset);
      const fechaStr = localDate.toISOString().slice(0, 10);
      
      const primerDiaMes = new Date(localDate.getFullYear(), localDate.getMonth(), 1).toISOString().slice(0, 10);
      
      const dayOfWeek = localDate.getDay(); 
      const diff = localDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
      const primerDiaSemana = new Date(localDate.setDate(diff)).toISOString().slice(0, 10);

      // Ventas de hoy
      const vHoy = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) = :fechaStr', { fechaStr })
        .andWhere("venta.estatus = 'Completada'")
        .select(['SUM(venta.total_pagado) as total', 'COUNT(venta.id_venta) as count'])
        .getRawOne();
        
      // Ventas semana
      const vSemana = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) >= :primerDiaSemana', { primerDiaSemana })
        .andWhere("venta.estatus = 'Completada'")
        .select(['SUM(venta.total_pagado) as total', 'COUNT(venta.id_venta) as count'])
        .getRawOne();

      // Ventas mes
      const vMes = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) >= :primerDiaMes', { primerDiaMes })
        .andWhere("venta.estatus = 'Completada'")
        .select(['SUM(venta.total_pagado) as total', 'COUNT(venta.id_venta) as count'])
        .getRawOne();

      // Devoluciones hoy
      const dHoy = await this.ventaRepo.createQueryBuilder('venta')
        .where('DATE(venta.fecha_venta) = :fechaStr', { fechaStr })
        .andWhere("venta.estatus = 'Cancelada'")
        .select(['SUM(venta.total_pagado) as total', 'COUNT(venta.id_venta) as count'])
        .getRawOne();

      // Sin Stock
      const sinStock = await this.productoRepo.createQueryBuilder('producto')
        .where('producto.stock <= 0')
        .andWhere('producto.estatus = 1')
        .getCount();

      const ultimosMovimientos = await this.ventaRepo.find({
        where: { estatus: 'Completada' },
        relations: { detalles: { producto: true }, usuario: true },
        order: { fechaVenta: 'DESC' },
        take: 10
      });

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const startOfMonthStr = new Date(startOfMonth.getTime() - startOfMonth.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

      const topProductosResult = await this.ventaDetalleRepo.createQueryBuilder('detalle')
        .innerJoin('detalle.venta', 'venta')
        .innerJoin('detalle.producto', 'producto')
        .where('DATE(venta.fecha_venta) >= :startOfMonth', { startOfMonth: startOfMonthStr })
        .andWhere("venta.estatus = 'Completada'")
        .select([
          'producto.id_producto AS id_producto',
          'producto.nombre AS nombre',
          'SUM(detalle.cantidad) AS cantidad_vendida',
          'SUM(detalle.subtotal) AS ingreso_total'
        ])
        .groupBy('producto.id_producto')
        .orderBy('cantidad_vendida', 'DESC')
        .limit(5)
        .getRawMany();

      const topProductos = topProductosResult.map(item => ({
        id_producto: item.id_producto,
        nombre: item.nombre,
        cantidad_vendida: Number(item.cantidad_vendida),
        ingreso_total: Number(item.ingreso_total)
      }));

      return {
        ventasHoy: Number(vHoy?.total || 0),
        ticketsHoy: Number(vHoy?.count || 0),
        ventasSemana: Number(vSemana?.total || 0),
        ticketsSemana: Number(vSemana?.count || 0),
        ventasMes: Number(vMes?.total || 0),
        ticketsMes: Number(vMes?.count || 0),
        devolucionesHoy: Number(dHoy?.total || 0),
        ticketsDevolucionesHoy: Number(dHoy?.count || 0),
        sinStock,
        totalClientes,
        movimientosRecientes: 0,
        ultimosMovimientos: ultimosMovimientos.map(v => ({
          fecha: v.fechaVenta,
          descripcion: Venta \u0023,
          monto: v.totalPagado,
          cajero: v.usuario?.nombreCompleto || 'U',
          detalles: v.detalles
        })),
        topProductos
      };
    } catch (error) {'''

start_idx = text.find('  async getResumen() {')
end_idx = text.find('      } catch (error) {', start_idx)
if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + new_logic + text[end_idx + 23:]

with open('src/dashboard/dashboard.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
