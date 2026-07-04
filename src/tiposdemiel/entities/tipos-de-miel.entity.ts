import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tiposdemiel')
export class TiposDeMiel {
  @PrimaryGeneratedColumn({ name: 'idTipoDeMiel' })
  idTipoDeMiel: number;

  @Column({ type: 'varchar', length: 255 })
  tipoDeMiel: string;

  @Column({ type: 'int', nullable: true })
  orden: number;
}
