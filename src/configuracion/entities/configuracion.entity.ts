import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryGeneratedColumn()
  idConfiguracion: number;

  @Column({ type: 'varchar', length: 150 })
  nombreNegocio: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rfc: string;

  @Column({ type: 'text', nullable: true })
  mensajeTicket: string;

  @Column({ type: 'varchar', length: 50, default: '58mm' })
  anchoTicket: string;

  // Other options...
  @Column({ type: 'boolean', default: false })
  imprimirLogo: boolean;
}
