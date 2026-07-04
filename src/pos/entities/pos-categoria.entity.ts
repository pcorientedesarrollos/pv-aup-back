import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosProducto } from './pos-producto.entity';
import { PosEmpresa } from './pos-empresa.entity';

@Entity('pos_categorias')
export class PosCategoria {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  idCategoria: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, default: 'bg-slate-600' })
  color: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => PosProducto, (producto) => producto.categoria)
  productos: PosProducto[];

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @ManyToOne(() => PosEmpresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: PosEmpresa;
}
