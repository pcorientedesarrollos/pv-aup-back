import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('almacenencabezadocera')
export class AlmacenEncabezadoCera {
  @PrimaryGeneratedColumn({ name: 'idAlmacen' })
  idAlmacen: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'int' })
  tipoPersona: number;

  @Column({ type: 'int' })
  idProveedor: number;

  @Column({ type: 'varchar', length: 255 })
  folio: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  kg: number;

  @Column({ type: 'int' })
  tipo: number;

  @Column({ type: 'int', nullable: true })
  clasificacion: number;

  @Column({ type: 'int' })
  tipoCera: number;

  @Column({ type: 'int' })
  idReporteDescarga: number;
}
