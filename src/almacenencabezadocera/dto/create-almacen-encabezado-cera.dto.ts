import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAlmacenEncabezadoCeraDto {
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

  @IsNumber()
  kg: number;

  @IsInt()
  tipo: number;

  @IsOptional()
  @IsInt()
  clasificacion?: number;

  @IsInt()
  tipoCera: number;

  @IsInt()
  idReporteDescarga: number;
}
