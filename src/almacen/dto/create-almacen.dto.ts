import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateAlmacenDto {
  @IsInt()
  idAlmacenEncabezado: number;

  @IsString()
  zona: string;

  @IsString()
  trazabilidad: string;

  @IsInt()
  pesoLista: number;

  @IsInt()
  bruto: number;

  @IsInt()
  tara: number;

  @IsInt()
  neto: number;

  @IsInt()
  diferencia: number;

  @IsNumber()
  humedad: number;

  @IsInt()
  autorizado: number;

  @IsNumber()
  precio: number;

  @IsNumber()
  costoTotal: number;

  @IsInt()
  estado: number;

  @IsInt()
  aprobado: number;

  @IsInt()
  referencia: number;
}
