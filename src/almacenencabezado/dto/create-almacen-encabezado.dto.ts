import { IsDateString, IsInt, IsNumber, IsString } from 'class-validator';

export class CreateAlmacenEncabezadoDto {
  @IsDateString()
  fecha: string;

  @IsInt()
  idProveedor: number;

  @IsString()
  folio: string;

  @IsNumber()
  totalCompra: number;

  @IsInt()
  idReporteDescarga: number;

  @IsString()
  clasificacionMiel: string;
}
