import { IsDateString, IsInt, IsNumber } from 'class-validator';

export class CreateCubetasEncabezadoAltiplanoDto {
  @IsDateString()
  fecha: string;

  @IsInt()
  idProveedor: number;

  @IsNumber()
  totalCompra: number;

  @IsInt()
  folioEntradaTambor: number;

  @IsInt()
  idReporteDescarga: number;
}
