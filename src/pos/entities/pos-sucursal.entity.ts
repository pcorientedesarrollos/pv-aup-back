import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosEmpresa } from './pos-empresa.entity';

@Entity('pos_sucursales')
export class PosSucursal {
  @PrimaryGeneratedColumn({ name: 'id_sucursal' })
  idSucursal: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 500, nullable: true })
  direccion: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => PosEmpresa, (empresa) => empresa.sucursales)
  @JoinColumn({ name: 'id_empresa' })
  empresa: PosEmpresa;
}
