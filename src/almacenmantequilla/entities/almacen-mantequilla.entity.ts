import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('almacen_mantequilla')
export class AlmacenMantequilla {
  @PrimaryGeneratedColumn({ name: 'idAlmacen' })
  idAlmacen: number;

  @Column({ type: 'int' })
  idAlmacenEncabezado: number;

  @Column({ type: 'varchar', length: 255 })
  zona: string;

  @Column({ type: 'varchar', length: 100 })
  trazabilidad: string;

  @Column({ type: 'int' })
  pesoLista: number;

  @Column({ type: 'int' })
  bruto: number;

  @Column({ type: 'int' })
  tara: number;

  @Column({ type: 'int' })
  neto: number;

  @Column({ type: 'int' })
  diferencia: number;

  @Column({ type: 'int' })
  humedad: number;

  @Column({ type: 'tinyint' })
  autorizado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoTotal: number;

  @Column({ type: 'int' })
  estado: number;

  @Column({ type: 'int' })
  aprobado: number;

  @Column({ type: 'int' })
  referencia: number;
}

