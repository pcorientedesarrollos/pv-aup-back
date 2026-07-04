import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateEnvasesFrascosDetalleSalidasDto {
  @IsInt()
  idSalidaEnvases: number;

  @IsString()
  tipo: string;

  @IsNumber()
  cantidad: number;

  @IsString()
  descripcion: string;

  @IsNumber()
  precioUnitario: number;

  @IsNumber()
  importe: number;

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
