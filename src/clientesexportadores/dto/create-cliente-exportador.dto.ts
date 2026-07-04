import { IsDateString, IsObject } from 'class-validator';

export class CreateClienteExportadorDto {
  @IsObject()
  datosCliente: object;

  @IsObject()
  datosDestino: object;

  @IsDateString()
  fechaAlta: string;
}
