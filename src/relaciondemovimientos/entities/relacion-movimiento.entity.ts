import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('relaciondemovimientos')
export class RelacionMovimiento {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'int' })
  tipoMovimiento: number;

  @Column({ type: 'int', nullable: true })
  ingreso: number;

  @Column({ type: 'int', nullable: true })
  egreso: number;

  @Column({ type: 'int' })
  poliza: number;

  @Column({ type: 'int', nullable: true })
  cajaChica: number;

  @Column({ type: 'int' })
  idMovimiento: number;
}
