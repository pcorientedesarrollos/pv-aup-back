import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('envasesfrascosencabezadosalidas')
export class EnvasesFrascosEncabezadoSalidas {
  @PrimaryGeneratedColumn({ name: 'idSalidaEnvases' })
  idSalidaEnvases: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'int' })
  idProveedor: number;

  @Column({ type: 'int' })
  cantidadTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importeTotal: number;

  @Column({ type: 'int' })
  tipoCliente: number;

  @Column({ type: 'int' })
  idReporteCarga: number;
}
