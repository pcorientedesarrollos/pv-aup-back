import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateEnvasesFrascosEncabezadoEntradasDto {
  @IsDateString()
  fecha: string;

  @IsInt()
  idProveedor: number;

  @IsNumber()
  cantidadTotal: number;

  @IsNumber()
  importeTotal: number;

  @IsOptional()
  @IsInt()
  tipoCliente?: number;

  @IsInt()
  idReporteDescarga: number;
}
