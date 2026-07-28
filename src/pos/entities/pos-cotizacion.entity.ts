import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosUsuario } from './pos-usuario.entity';
import { PosCliente } from './pos-cliente.entity';
import { PosCotizacionDetalle } from './pos-cotizacion-detalle.entity';

@Entity('pos_cotizaciones')
export class PosCotizacion {
  @PrimaryGeneratedColumn({ name: 'id_cotizacion' })
  idCotizacion: number;

  @Column({ length: 50, unique: true })
  folio: string;

  @CreateDateColumn({ name: 'fecha_emision' })
  fechaEmision: Date;

  @Column({ name: 'vigencia_dias', default: 15 })
  vigenciaDias: number;

  @Column({ length: 255, nullable: true })
  titulo: string;

  @Column('text', { nullable: true })
  observaciones: string;

  @ManyToOne(() => PosUsuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @Column({ name: 'id_venta', type: 'int', nullable: true })
  idVenta: number;

  @ManyToOne(() => PosCliente, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: PosCliente;

  @Column({ name: 'nombre_cliente_temporal', length: 255, nullable: true })
  nombreClienteTemporal: string;

  @Column('decimal', { name: 'costo_base', precision: 10, scale: 2, default: 0.00 })
  costoBase: number;

  @Column('decimal', { name: 'utilidad_total', precision: 10, scale: 2, default: 0.00 })
  utilidadTotal: number;

  @Column('decimal', { name: 'tipo_cambio', precision: 10, scale: 4, default: 1.0000 })
  tipoCambio: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  descuento: number;

  @Column('decimal', { name: 'total_iva', precision: 10, scale: 2, default: 0.00 })
  totalIva: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  total: number;

  @Column({ length: 20, default: 'Borrador' }) // Borrador, Aprobada, Cancelada, Vencida
  estatus: string;

  @OneToMany(() => PosCotizacionDetalle, detalle => detalle.cotizacion, { cascade: true })
  detalles: PosCotizacionDetalle[];

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;
}
