import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosTraspaso } from './pos-traspaso.entity';
import { PosProducto } from './pos-producto.entity';

@Entity('pos_traspasos_detalle')
export class PosTraspasoDetalle {
  @PrimaryGeneratedColumn({ name: 'id_detalle' })
  idDetalle: number;

  @ManyToOne(() => PosTraspaso, traspaso => traspaso.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_traspaso' })
  traspaso: PosTraspaso;

  @ManyToOne(() => PosProducto, { nullable: false })
  @JoinColumn({ name: 'id_producto' })
  producto: PosProducto; // Este será el producto de origen

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;
}
