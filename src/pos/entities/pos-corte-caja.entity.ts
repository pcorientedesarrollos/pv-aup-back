import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosUsuario } from './pos-usuario.entity';

@Entity('pos_cortes_caja')
export class PosCorteCaja {
  @PrimaryGeneratedColumn({ name: 'id_corte' })
  idCorte: number;

  @ManyToOne(() => PosUsuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @CreateDateColumn({ name: 'fecha_apertura' })
  fechaApertura: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamp', nullable: true })
  fechaCierre: Date;

  @Column('decimal', { name: 'fondo_inicial', precision: 10, scale: 2, default: 0.00 })
  fondoInicial: number;

  @Column('decimal', { name: 'efectivo_declarado', precision: 10, scale: 2, default: 0.00 })
  efectivoDeclarado: number;

  @Column({ length: 20, default: 'Abierto' })
  estatus: string;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;
}
