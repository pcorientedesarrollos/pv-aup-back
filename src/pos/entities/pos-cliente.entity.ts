import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';

@Entity('pos_clientes')
export class PosCliente {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  idCliente: number;

  @Column({ name: 'nombre_completo', length: 255 })
  nombreCompleto: string;

  @Column({ length: 20, nullable: true })
  rfc: string;

  @Column({ length: 100, nullable: true })
  correo: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ length: 10, nullable: true })
  cp: string;

  @Column({ length: 10, nullable: true })
  regimenFiscal: string;

  @Column({ length: 10, nullable: true })
  usoCfdi: string;

  @Column({ length: 10, nullable: true })
  formaPago: string;

  @Column({ length: 10, nullable: true })
  metodoPago: string;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;
}
