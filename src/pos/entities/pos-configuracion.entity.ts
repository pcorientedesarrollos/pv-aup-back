import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';

@Entity('pos_configuracion')
export class PosConfiguracion {
  @PrimaryGeneratedColumn({ name: 'id_config' })
  idConfig: number;

  @Column({ name: 'nombre_empresa', length: 255, default: 'AUP POS' })
  nombreEmpresa: string;

  @Column({ name: 'rfc_empresa', length: 20, nullable: true })
  rfcEmpresa: string;

  @Column({ type: 'text', name: 'mensaje_ticket', nullable: true })
  mensajeTicket: string;

  @Column({ name: 'impresora_activa', length: 100, nullable: true })
  impresoraActiva: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0.00 })
  iva: number;

  @Column({ name: 'ancho_ticket', length: 50, default: '58mm' })
  anchoTicket: string;

  @Column({ name: 'imprimir_logo', type: 'boolean', default: false })
  imprimirLogo: boolean;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;
}
