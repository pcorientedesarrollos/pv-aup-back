import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosCotizacion } from './pos-cotizacion.entity';
import { PosProducto } from './pos-producto.entity';

@Entity('pos_cotizaciones_detalles')
export class PosCotizacionDetalle {
  @PrimaryGeneratedColumn({ name: 'id_cotizacion_detalle' })
  idCotizacionDetalle: number;

  @ManyToOne(() => PosCotizacion, cotizacion => cotizacion.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cotizacion' })
  cotizacion: PosCotizacion;

  @ManyToOne(() => PosProducto, { nullable: true })
  @JoinColumn({ name: 'id_producto' })
  producto: PosProducto;

  @Column({ name: 'nombre_concepto', length: 255, nullable: true })
  nombreConcepto: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;

  @Column('decimal', { name: 'precio_unitario', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ length: 3, default: 'MXN' })
  moneda: string;

  @Column('decimal', { name: 'utilidad_porcentaje', precision: 5, scale: 2, default: 0.00 })
  utilidadPorcentaje: number;

  @Column('decimal', { name: 'utilidad_valor', precision: 10, scale: 2, default: 0.00 })
  utilidadValor: number;

  @Column('decimal', { name: 'precio_con_utilidad', precision: 10, scale: 2, default: 0.00 })
  precioConUtilidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  importe: number;
}
