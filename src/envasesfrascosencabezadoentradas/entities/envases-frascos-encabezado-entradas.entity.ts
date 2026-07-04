import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('envasesfrascosencabezadoentradas')
export class EnvasesFrascosEncabezadoEntradas {
  @PrimaryGeneratedColumn({ name: 'idEntradaEnvases' })
  idEntradaEnvases: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'int' })
  idProveedor: number;

  @Column({ type: 'int' })
  cantidadTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importeTotal: number;

  @Column({ type: 'int', nullable: true })
  tipoCliente: number;

  @Column({ type: 'int' })
  idReporteDescarga: number;
}
