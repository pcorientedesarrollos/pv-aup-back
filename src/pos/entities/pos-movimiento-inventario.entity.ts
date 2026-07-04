import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosProducto } from './pos-producto.entity';
import { PosUsuario } from './pos-usuario.entity';

@Entity('pos_movimientos_inventario')
export class PosMovimientoInventario {
  @PrimaryGeneratedColumn({ name: 'id_movimiento' })
  idMovimiento: number;

  @ManyToOne(() => PosProducto)
  @JoinColumn({ name: 'id_producto' })
  producto: PosProducto;

  @ManyToOne(() => PosUsuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @Column({ name: 'tipo_movimiento', length: 50 })
  tipoMovimiento: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;

  @Column('decimal', { name: 'costo_unitario', precision: 10, scale: 2, nullable: true })
  costoUnitario: number;

  @CreateDateColumn()
  fecha: Date;

  @Column({ length: 255, nullable: true })
  referencia: string;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;
}
