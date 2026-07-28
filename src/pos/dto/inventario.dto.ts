import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class InventarioDto {
  @IsNumber()
  @IsNotEmpty()
  idProducto!: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad!: number;

  @IsString()
  @IsOptional()
  referencia?: string;

  @IsString()
  @IsOptional()
  tipoMovimiento?: string;

  @IsNumber()
  @IsOptional()
  costoUnitario?: number;

  @IsBoolean()
  @IsOptional()
  actualizarCosto?: boolean;
}

export class EditarMovimientoDto {
  @IsNumber()
  @IsNotEmpty()
  cantidadNueva!: number;

  @IsString()
  @IsOptional()
  referencia?: string;

  @IsNumber()
  @IsOptional()
  idUsuarioModifica?: number;
}
