import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosCategoria } from './pos-categoria.entity';
import { PosProductoCodigo } from './pos-producto-codigo.entity';

@Entity('pos_productos')
export class PosProducto {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  idProducto: number;

  @Column({ name: 'codigo_barras', length: 100, unique: true, nullable: true })
  codigoBarras: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('decimal', { name: 'precio_unitario', precision: 10, scale: 2, default: 0.00 })
  precioUnitario: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0.00 })
  iva: number;

  @Column('decimal', { name: 'precio_publico', precision: 10, scale: 2, default: 0.00 })
  precioPublico: number;

  @Column('decimal', { name: 'precio_mayoreo', precision: 10, scale: 2, nullable: true })
  precioMayoreo: number;

  @Column({ name: 'imagen_url', length: 255, nullable: true })
  imagenUrl: string;

  @Column('decimal', { name: 'stock_actual', precision: 10, scale: 2, default: 0.00 })
  stockActual: number;

  @Column('decimal', { name: 'stock_minimo', precision: 10, scale: 2, default: 0.00 })
  stockMinimo: number;

  @Column({ name: 'clave_prod_serv', length: 20, default: '01010101' })
  claveProdServ: string;

  @Column({ name: 'clave_unidad', length: 10, default: 'H87' })
  claveUnidad: string;

  @ManyToOne(() => PosCategoria, (categoria) => categoria.productos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_categoria' })
  categoria: PosCategoria;

  @Column({ default: true })
  activo: boolean;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @OneToMany(() => PosProductoCodigo, codigo => codigo.producto, { cascade: true })
  codigosAdicionales: PosProductoCodigo[];
}
