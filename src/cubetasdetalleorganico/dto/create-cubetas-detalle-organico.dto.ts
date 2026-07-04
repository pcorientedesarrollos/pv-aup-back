import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateCubetasDetalleOrganicoDto {
  @IsInt()
  idAlmacenEncabezado: number;

  @IsString()
  zona: string;

  @IsString()
  trazabilidad: string;

  @IsNumber()
  pesoLista: number;

  @IsNumber()
  bruto: number;

  @IsNumber()
  tara: number;

  @IsNumber()
  neto: number;

  @IsNumber()
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
  tamborAsignado: number;

  @IsInt()
  aprobado: number;

  @IsInt()
  referencia: number;
}
