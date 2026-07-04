import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('proveedor')
export class Proveedor {
  @PrimaryGeneratedColumn({ name: 'idProveedor' })
  idProveedor: number;

  @Column({ type: 'varchar', length: 20 })
  tipo: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'int' })
  idComprador: number;

  @Column({ type: 'int' })
  idDatosFiscales: number;

  @Column({ type: 'int' })
  idDireccion: number;

  @Column({ type: 'varchar', length: 20 })
  idSagarpa: string;

  @Column({ type: 'int' })
  tipoDeMiel: number;

  @Column({ type: 'int' })
  empresa: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ type: 'int' })
  idEstado: number;

  @Column({ type: 'int' })
  activoInactivo: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: number;

  @Column({ type: 'int' })
  deleteProve: number;
}
