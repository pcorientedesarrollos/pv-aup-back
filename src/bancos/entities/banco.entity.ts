import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bancos')
export class Banco {
  @PrimaryGeneratedColumn({ name: 'idBanco' })
  idBanco: number;

  @Column({ type: 'varchar', length: 25 })
  banco: string;

  @Column({ type: 'varchar', length: 85 })
  logotipo: string;
}
