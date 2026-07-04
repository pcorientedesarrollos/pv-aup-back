import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosVenta } from './pos-venta.entity';
import { PosSucursal } from './pos-sucursal.entity';

@Entity('pos_proformas')
export class PosProforma {
  @PrimaryGeneratedColumn({ name: 'id_proforma' })
  idProforma: number;

  @Column({ name: 'folio_interno', length: 50, nullable: true })
  folioInterno: string;

  @CreateDateColumn({ name: 'fecha_emision' })
  fechaEmision: Date;

  @Column({ name: 'nombre_cliente', length: 255 })
  nombreCliente: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'url_pdf', type: 'text', nullable: true })
  urlPdf: string;

  @ManyToOne(() => PosVenta)
  @JoinColumn({ name: 'id_venta' })
  venta: PosVenta;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;
}
