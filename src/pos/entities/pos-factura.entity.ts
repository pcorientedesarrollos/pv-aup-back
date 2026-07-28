import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosVenta } from './pos-venta.entity';
import { PosSucursal } from './pos-sucursal.entity';

@Entity('pos_facturas')
export class PosFactura {
  @PrimaryGeneratedColumn({ name: 'id_factura' })
  idFactura: number;

  @Column({ name: 'uuid', length: 50, nullable: true })
  uuid: string;

  @CreateDateColumn({ name: 'fecha_emision' })
  fechaEmision: Date;

  @Column({ name: 'rfc_cliente', length: 15 })
  rfcCliente: string;

  @Column({ name: 'nombre_cliente', length: 255 })
  nombreCliente: string;

  @Column({ name: 'uso_cfdi', length: 5, default: 'G03' })
  usoCfdi: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'url_pdf', type: 'text', nullable: true })
  urlPdf: string;

  @Column({ name: 'url_xml', type: 'text', nullable: true })
  urlXml: string;

  @Column({ name: 'facturapi_id', length: 50, nullable: true })
  facturapiId: string;

  @Column({ length: 20, default: 'Emitida' })
  estatus: string;

  @ManyToOne(() => PosVenta)
  @JoinColumn({ name: 'id_venta' })
  venta: PosVenta;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @Column({ name: 'forma_pago', length: 50, nullable: true })
  formaPago: string;

  @Column({ name: 'metodo_pago', length: 50, nullable: true })
  metodoPago: string;

  @Column({ name: 'regimen_fiscal', length: 50, nullable: true })
  regimenFiscal: string;

  @Column({ name: 'cp', length: 10, nullable: true })
  cp: string;
}
