import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDerivadosAlmacenEncabezadoSalidasDto {
  @IsDateString()
  fecha: string;

  @IsInt()
  tipoPersona: number;

  @IsInt()
  idProveedor: number;

  @IsString()
  folio: string;

  @IsNumber()
  total: number;

  @IsInt()
  tipo: number;

  @IsOptional()
  @IsInt()
  clasificacion?: number;

  @IsInt()
  idReporteCarga: number;
}
