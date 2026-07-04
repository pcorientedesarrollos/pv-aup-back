import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosCompra } from './pos-compra.entity';
import { PosProducto } from './pos-producto.entity';

@Entity('pos_compras_detalle')
export class PosCompraDetalle {
  @PrimaryGeneratedColumn({ name: 'id_detalle_compra' })
  idDetalleCompra: number;

  @ManyToOne(() => PosCompra, compra => compra.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_compra' })
  compra: PosCompra;

  @ManyToOne(() => PosProducto, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_producto' })
  producto: PosProducto;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;

  @Column('decimal', { name: 'precio_costo', precision: 10, scale: 2, default: 0.00 })
  precioCosto: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  subtotal: number;
}
