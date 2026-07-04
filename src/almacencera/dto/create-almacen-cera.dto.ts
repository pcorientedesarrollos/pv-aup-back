import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAlmacenCeraDto {
  @IsInt()
  idAlmacenEncabezado: number;

  @IsInt()
  zona: number;

  @IsNumber()
  cantidad: number;

  @IsOptional()
  @IsInt()
  unidad?: number;

  @IsString()
  descripcion: string;

  @IsNumber()
  costoUnitario: number;

  @IsNumber()
  importe: number;

  @IsNumber()
  kgTotal: number;

  @IsInt()
  clasificacion: number;

  @IsInt()
  idMovimiento: number;

  @IsString()
  movimiento: string;

  @IsInt()
  idSubcuenta: number;

  @IsString()
  subcuenta: string;

  @IsInt()
  idConcepto: number;

  @IsString()
  concepto: string;
}
