import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('derivadosalmacendetalle')
export class DerivadosAlmacenDetalle {
  @PrimaryGeneratedColumn({ name: 'idProductoDerivado' })
  idProductoDerivado: number;

  @Column({ type: 'int' })
  idEntrada: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'int' })
  unidad: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'float' })
  costoUnitario: number;

  @Column({ type: 'float' })
  importe: number;

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
