import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PosProducto } from './pos-producto.entity';

@Entity('pos_productos_codigos')
export class PosProductoCodigo {
  @PrimaryGeneratedColumn()
  idCodigo: number;

  @Column({ name: 'codigo_barras', length: 100 })
  codigoBarras: string;

  @ManyToOne(() => PosProducto, producto => producto.codigosAdicionales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_producto' })
  producto: PosProducto;
}
