import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auxiliardebancos')
export class AuxiliarBanco {
  @PrimaryGeneratedColumn({ name: 'idAuxiliar' })
  idAuxiliar: number;

  @Column({ type: 'int' })
  idBanco: number;

  @Column({ type: 'int' })
  idCuenta: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'int' })
  idMes: number;

  @Column({ type: 'time' })
  hora: string;

  @Column({ type: 'varchar', length: 30 })
  referencia: string;

  @Column({ type: 'int' })
  tipoDePersona: number;

  @Column({ type: 'int' })
  nombreDe: number;

  @Column({ type: 'varchar', length: 80 })
  concepto: string;

  @Column({ type: 'int' })
  idSubcuenta: number;

  @Column({ type: 'varchar', length: 80 })
  descripcion: string;

  @Column({ type: 'varchar', length: 80 })
  movimiento: string;

  @Column({ type: 'varchar', length: 20 })
  tipoDepositoCompra: string;

  @Column({ type: 'decimal', precision: 16, scale: 6 })
  cantidad: number;

  @Column({ type: 'int' })
  tipoMovimiento: number;

  @Column({ type: 'int', nullable: true })
  idPolizaCheque: number;

  @Column({ type: 'int' })
  ingresoEgreso: number;

  @Column({ type: 'int', nullable: true })
  idTransferencia: number;

  @Column({ type: 'int', nullable: true })
  idSubsubcuenta: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subsubcuenta: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  kg: number;
}
