import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cubetasdetalle_mezquite')
export class CubetasDetalleMezquite {
  @PrimaryGeneratedColumn({ name: 'idAlmacen' })
  idAlmacen: number;

  @Column({ type: 'int' })
  idAlmacenEncabezado: number;

  @Column({ type: 'varchar', length: 255 })
  zona: string;

  @Column({ type: 'varchar', length: 15 })
  trazabilidad: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pesoLista: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  bruto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tara: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  neto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  diferencia: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  humedad: number;

  @Column({ type: 'tinyint' })
  autorizado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoTotal: number;

  @Column({ type: 'int' })
  tamborAsignado: number;

  @Column({ type: 'int' })
  aprobado: number;

  @Column({ type: 'int' })
  referencia: number;
}

