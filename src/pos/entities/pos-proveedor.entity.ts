import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosCompra } from './pos-compra.entity';

@Entity('pos_proveedores')
export class PosProveedor {
  @PrimaryGeneratedColumn({ name: 'id_proveedor' })
  idProveedor: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 150, nullable: true })
  contacto: string;

  @Column({ length: 30, nullable: true })
  telefono: string;

  @Column({ length: 150, nullable: true })
  correo: string;

  @Column({ length: 20, nullable: true })
  rfc: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ default: true })
  activo: boolean;

  @ManyToOne(() => PosSucursal, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @OneToMany(() => PosCompra, compra => compra.proveedor)
  compras: PosCompra[];
}
