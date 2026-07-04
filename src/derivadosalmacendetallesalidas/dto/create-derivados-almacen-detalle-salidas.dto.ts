import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateDerivadosAlmacenDetalleSalidasDto {
  @IsInt()
  idSalida: number;

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
