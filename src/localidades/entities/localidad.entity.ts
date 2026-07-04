import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('localidades')
export class Localidad {
  @PrimaryGeneratedColumn({ name: 'idlocalidad' })
  idlocalidad: number;

  @Column({ type: 'varchar', length: 50 })
  localidad: string;

  @Column({ type: 'int' })
  idzona: number;

  @Column({ type: 'int' })
  estado: number;

  @Column({ type: 'int' })
  idEstado: number;
}
