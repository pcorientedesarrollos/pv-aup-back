import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosUsuario } from './pos-usuario.entity';
import { PosProveedor } from './pos-proveedor.entity';
import { PosCompraDetalle } from './pos-compra-detalle.entity';

@Entity('pos_compras')
export class PosCompra {
  @PrimaryGeneratedColumn({ name: 'id_compra' })
  idCompra: number;

  @Column({ length: 50, unique: true })
  folio: string;

  @CreateDateColumn({ name: 'fecha_compra' })
  fechaCompra: Date;

  @ManyToOne(() => PosProveedor, proveedor => proveedor.compras, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: PosProveedor;

  @ManyToOne(() => PosUsuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @ManyToOne(() => PosSucursal, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  total: number;

  @Column({ name: 'folio_factura_proveedor', length: 100, nullable: true })
  folioFacturaProveedor: string;

  @Column({ name: 'url_factura_pdf', length: 500, nullable: true })
  urlFacturaPdf: string;

  @Column({ name: 'url_factura_xml', length: 500, nullable: true })
  urlFacturaXml: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @OneToMany(() => PosCompraDetalle, detalle => detalle.compra, { cascade: true })
  detalles: PosCompraDetalle[];
}
