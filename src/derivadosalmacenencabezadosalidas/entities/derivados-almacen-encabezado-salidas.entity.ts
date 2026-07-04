import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('derivadosalmacenencabezado_salidas')
export class DerivadosAlmacenEncabezadoSalidas {
  @PrimaryGeneratedColumn({ name: 'idSalida' })
  idSalida: number;

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

  @Column({ type: 'int' })
  tipo: number;

  @Column({ type: 'int', nullable: true })
  clasificacion: number;

  @Column({ type: 'int' })
  idReporteCarga: number;
}
