import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cubetasencabezado_mantequilla')
export class CubetasEncabezadoMantequilla {
  @PrimaryGeneratedColumn({ name: 'idAlmacen' })
  idAlmacen: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'int' })
  idProveedor: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCompra: number;

  @Column({ type: 'int' })
  folioEntradaTambor: number;

  @Column({ type: 'int' })
  idReporteDescarga: number;
}
