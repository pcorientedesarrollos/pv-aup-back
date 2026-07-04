import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateDerivadosAlmacenDetalleDto {
  @IsInt()
  idEntrada: number;

  @IsNumber()
  cantidad: number;

  @IsInt()
  unidad: number;

  @IsString()
  descripcion: string;

  @IsNumber()
  costoUnitario: number;

  @IsNumber()
  importe: number;

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
