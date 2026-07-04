import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cuentasbancarias')
export class CuentaBancaria {
  @PrimaryGeneratedColumn({ name: 'idCuenta' })
  idCuenta: number;

  @Column({ type: 'varchar', length: 50 })
  numDeCuenta: string;

  @Column({ type: 'int' })
  idBanco: number;

  @Column({ type: 'int' })
  moneda: number;
}
