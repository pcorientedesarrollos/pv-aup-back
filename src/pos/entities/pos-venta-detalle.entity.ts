import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosVenta } from './pos-venta.entity';
import { PosProducto } from './pos-producto.entity';

@Entity('pos_ventas_detalle')
export class PosVentaDetalle {
  @PrimaryGeneratedColumn({ name: 'id_detalle' })
  idDetalle: number;

  @ManyToOne(() => PosVenta, venta => venta.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venta' })
  venta: PosVenta;

  @ManyToOne(() => PosProducto)
  @JoinColumn({ name: 'id_producto' })
  producto: PosProducto;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;

  @Column('decimal', { name: 'precio_unitario', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column('decimal', { name: 'monto_iva', precision: 10, scale: 2, default: 0.00 })
  montoIva: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  descuento: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;
}
