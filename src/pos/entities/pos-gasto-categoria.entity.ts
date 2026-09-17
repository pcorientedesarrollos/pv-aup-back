import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pos_gastos_categorias')
export class PosGastoCategoria {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  idCategoria: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ default: true })
  estatus: boolean;
}
