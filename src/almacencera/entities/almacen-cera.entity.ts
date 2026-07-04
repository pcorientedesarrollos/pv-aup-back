import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('almacencera')
export class AlmacenCera {
  @PrimaryGeneratedColumn({ name: 'idAlmacen' })
  idAlmacen: number;

  @Column({ type: 'int' })
  idAlmacenEncabezado: number;

  @Column({ type: 'int' })
  zona: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'int', nullable: true })
  unidad: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  kgTotal: number;

  @Column({ type: 'int' })
  clasificacion: number;

  @Column({ type: 'int' })
  idMovimiento: number;

  @Column({ type: 'varchar', length: 255 })
  movimiento: string;

  @Column({ type: 'int' })
  idSubcuenta: number;

  @Column({ type: 'varchar', length: 255 })
  subcuenta: string;

  @Column({ type: 'int' })
  idConcepto: number;

  @Column({ type: 'varchar', length: 255 })
  concepto: string;
}
