import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateRelacionMovimientoDto {
  @IsInt()
  tipoMovimiento: number;

  @IsOptional()
  @IsNumber()
  ingreso?: number;

  @IsOptional()
  @IsNumber()
  egreso?: number;

  @IsInt()
  poliza: number;

  @IsOptional()
  @IsInt()
  cajaChica?: number;

  @IsInt()
  idMovimiento: number;
}
