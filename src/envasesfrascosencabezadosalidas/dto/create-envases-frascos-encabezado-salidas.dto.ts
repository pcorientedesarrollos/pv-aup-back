import { IsDateString, IsInt, IsNumber } from 'class-validator';

export class CreateEnvasesFrascosEncabezadoSalidasDto {
  @IsDateString()
  fecha: string;

  @IsInt()
  idProveedor: number;

  @IsNumber()
  cantidadTotal: number;

  @IsNumber()
  importeTotal: number;

  @IsInt()
  tipoCliente: number;

  @IsInt()
  idReporteCarga: number;
}
