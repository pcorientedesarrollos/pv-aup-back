import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosUsuario } from './pos-usuario.entity';
import { PosCliente } from './pos-cliente.entity';
import { PosCorteCaja } from './pos-corte-caja.entity';
import { PosVentaDetalle } from './pos-venta-detalle.entity';
import { PosFactura } from './pos-factura.entity';

@Entity('pos_ventas')
export class PosVenta {
  @PrimaryGeneratedColumn({ name: 'id_venta' })
  idVenta: number;

  @Column({ length: 50, unique: true })
  folio: string;

  @CreateDateColumn({ name: 'fecha_venta' })
  fechaVenta: Date;

  @ManyToOne(() => PosUsuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @ManyToOne(() => PosCliente, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: PosCliente;

  @ManyToOne(() => PosCorteCaja)
  @JoinColumn({ name: 'id_corte' })
  corte: PosCorteCaja;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  descuento: number;

  @Column('decimal', { name: 'total_iva', precision: 10, scale: 2, default: 0.00 })
  totalIva: number;

  @Column('decimal', { name: 'total_pagado', precision: 10, scale: 2, default: 0.00 })
  totalPagado: number;

  @Column({ name: 'metodo_pago', length: 50, default: 'Efectivo' })
  metodoPago: string;

  @Column({ length: 20, default: 'Completada' })
  estatus: string;

  @OneToMany(() => PosVentaDetalle, detalle => detalle.venta, { cascade: true })
  detalles: PosVentaDetalle[];

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @OneToMany(() => PosFactura, factura => factura.venta)
  facturas: PosFactura[];
}
