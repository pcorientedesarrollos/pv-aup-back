import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';

@Entity('pos_usuarios')
export class PosUsuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ name: 'nombre_completo', length: 255 })
  nombreCompleto: string;

  @Column({ name: 'nombre_usuario', length: 50, unique: true })
  nombreUsuario: string;

  @Column({ name: 'contrasena_hash', length: 255 })
  contrasenaHash: string;

  @Column({ length: 50, default: 'Cajero' })
  rol: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;
}
