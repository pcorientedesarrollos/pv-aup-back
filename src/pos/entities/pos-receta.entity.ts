import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PosProducto } from './pos-producto.entity';

@Entity('pos_recetas')
export class PosReceta {
  @PrimaryGeneratedColumn({ name: 'id_receta' })
  idReceta: number;

  @ManyToOne(() => PosProducto, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_producto_padre' })
  productoPadre: PosProducto;

  @ManyToOne(() => PosProducto, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_producto_hijo' })
  productoHijo: PosProducto;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;
}
