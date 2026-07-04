import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('proveedoresmantto')
export class ProveedorMantto {
  @PrimaryGeneratedColumn({ name: 'idProveedorMantto' })
  idProveedorMantto: number;

  @Column({ type: 'int' })
  idArea: number;

  @Column({ type: 'date' })
  fechaRegistro: Date;

  @Column({ type: 'varchar', length: 100 })
  nombreProveedor: string;

  @Column({ type: 'varchar', length: 100 })
  nombreContacto: string;

  @Column({ type: 'int' })
  idTipoProveedor: number;

  @Column({ type: 'varchar', length: 80 })
  insumo: string;

  @Column({ type: 'varchar', length: 80 })
  domicilio: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 60 })
  correo: string;

  @Column({ type: 'varchar', length: 45 })
  web: string;

  @Column({ type: 'varchar', length: 80 })
  estatus: string;

  @Column({ type: 'varchar', length: 80 })
  credito: string;
}
