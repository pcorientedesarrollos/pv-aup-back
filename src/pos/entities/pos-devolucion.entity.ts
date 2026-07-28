import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosUsuario } from './pos-usuario.entity';
import { PosVenta } from './pos-venta.entity';

@Entity('pos_devoluciones')
export class PosDevolucion {
  @PrimaryGeneratedColumn({ name: 'id_devolucion' })
  idDevolucion: number;

  @ManyToOne(() => PosVenta, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venta' })
  venta: PosVenta;

  @CreateDateColumn({ name: 'fecha_devolucion' })
  fechaDevolucion: Date;

  @ManyToOne(() => PosUsuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @ManyToOne(() => PosSucursal, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @Column('decimal', { name: 'monto_devuelto', precision: 10, scale: 2, default: 0.00 })
  montoDevuelto: number;

  @Column({ length: 255, nullable: true })
  motivo: string;

  @Column({ length: 20, default: 'Total' })
  tipo: string; // 'Total' | 'Parcial'

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'json', nullable: true })
  items: { idProducto: number; nombre: string; cantidad: number; precioUnitario: number }[];
}
