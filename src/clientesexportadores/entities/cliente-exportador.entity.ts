import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clientesexportadores')
export class ClienteExportador {
  @PrimaryGeneratedColumn({ name: 'idClienteExportador' })
  idClienteExportador: number;

  @Column({ type: 'json' })
  datosCliente: object;

  @Column({ type: 'json' })
  datosDestino: object;

  @Column({ type: 'date' })
  fechaAlta: Date;
}
