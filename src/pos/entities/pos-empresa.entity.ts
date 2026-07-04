import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';

@Entity('pos_empresas')
export class PosEmpresa {
  @PrimaryGeneratedColumn({ name: 'id_empresa' })
  idEmpresa: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 500, nullable: true })
  logoUrl: string;

  @Column({ length: 20, default: '#f59e0b' }) // Default Amber-500
  colorPrincipal: string;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @OneToMany(() => PosSucursal, (sucursal) => sucursal.empresa)
  sucursales: PosSucursal[];
}
