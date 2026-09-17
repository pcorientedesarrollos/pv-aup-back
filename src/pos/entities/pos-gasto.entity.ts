import { PosGastoCategoria } from './pos-gasto-categoria.entity';
﻿import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PosSucursal } from './pos-sucursal.entity';
import { PosUsuario } from './pos-usuario.entity';
import { PosCorteCaja } from './pos-corte-caja.entity';

@Entity('pos_gastos')
export class PosGasto {
  @PrimaryGeneratedColumn({ name: 'id_gasto' })
  idGasto: number;

  @Column({ length: 255 })
  concepto: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => PosSucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: PosSucursal;

  @ManyToOne(() => PosUsuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: PosUsuario;

  @ManyToOne(() => PosCorteCaja, { nullable: true })
  @JoinColumn({ name: 'id_corte' })
  corte: PosCorteCaja;
  @ManyToOne(() => PosGastoCategoria, { nullable: true })
  @JoinColumn({ name: 'id_categoria' })
  categoria: PosGastoCategoria;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

}
