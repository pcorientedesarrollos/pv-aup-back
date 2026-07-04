import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('envasesfrascosdetalleentradas')
export class EnvasesFrascosDetalleEntradas {
  @PrimaryGeneratedColumn({ name: 'idDetalleEntrada' })
  idDetalleEntrada: number;

  @Column({ type: 'int' })
  idEntradaEnvases: number;

  @Column({ type: 'varchar', length: 255 })
  tipo: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'varchar', length: 300 })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe: number;

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
