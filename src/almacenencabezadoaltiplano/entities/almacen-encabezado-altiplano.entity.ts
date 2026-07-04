import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('almacenencabezado_altiplano')
export class AlmacenEncabezadoAltiplano {
  @PrimaryGeneratedColumn({ name: 'idAlmacen' })
  idAlmacen: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'int' })
  idProveedor: number;

  @Column({ type: 'varchar', length: 255 })
  folio: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCompra: number;

  @Column({ type: 'int' })
  idReporteDescarga: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clasificacionMiel: string;
}
