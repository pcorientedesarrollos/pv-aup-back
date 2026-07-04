import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('direccion')
export class Direccion {
  @PrimaryGeneratedColumn({ name: 'idDireccion' })
  idDireccion: number;

  @Column({ type: 'varchar', length: 10 })
  calle: string;

  @Column({ type: 'varchar', length: 10 })
  numeroExterior: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  numeroInterior: string;

  @Column({ type: 'varchar', length: 10 })
  cruzamientos: string;

  @Column({ type: 'int' })
  idEstado: number;

  @Column({ type: 'int' })
  idlocalidad: number;

  @Column({ type: 'varchar', length: 10 })
  codigoPostal: string;

  @Column({ type: 'varchar', length: 50 })
  colonia: string;

  @Column({ type: 'varchar', length: 85 })
  direccionCompleta: string;
}
