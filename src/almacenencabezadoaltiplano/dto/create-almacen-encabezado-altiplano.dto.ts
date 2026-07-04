import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAlmacenEncabezadoAltiplanoDto {
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

  @IsOptional()
  @IsString()
  clasificacionMiel?: string;
}
