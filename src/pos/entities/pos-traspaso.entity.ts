import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosUsuario } from './pos-usuario.entity';
import { PosTraspasoDetalle } from './pos-traspaso-detalle.entity';

@Entity('pos_traspasos')
export class PosTraspaso {
  @PrimaryGeneratedColumn({ name: 'id_traspaso' })
  idTraspaso: number;

  @Column({ length: 50, unique: true })
  folio: string;

  @ManyToOne(() => PosSucursal, { nullable: false })
  @JoinColumn({ name: 'id_sucursal_origen' })
  sucursalOrigen: PosSucursal;

  @ManyToOne(() => PosSucursal, { nullable: false })
  @JoinColumn({ name: 'id_sucursal_destino' })
  sucursalDestino: PosSucursal;

  @ManyToOne(() => PosUsuario, { nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;

  @Column({ length: 20, default: 'Completado' })
  estatus: string; // 'Completado', 'Cancelado'

  @Column('text', { nullable: true })
  observaciones: string;

  @OneToMany(() => PosTraspasoDetalle, detalle => detalle.traspaso)
  detalles: PosTraspasoDetalle[];
}
