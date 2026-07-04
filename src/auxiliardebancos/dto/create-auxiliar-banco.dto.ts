import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuxiliarBancoDto {
  @IsInt()
  idBanco: number;

  @IsInt()
  idCuenta: number;

  @IsDateString()
  fecha: string;

  @IsInt()
  idMes: number;

  @IsString()
  hora: string;

  @IsString()
  referencia: string;

  @IsInt()
  tipoDePersona: number;

  @IsInt()
  nombreDe: number;

  @IsString()
  concepto: string;

  @IsInt()
  idSubcuenta: number;

  @IsString()
  descripcion: string;

  @IsString()
  movimiento: string;

  @IsString()
  tipoDepositoCompra: string;

  @IsNumber()
  cantidad: number;

  @IsInt()
  tipoMovimiento: number;

  @IsOptional()
  @IsInt()
  idPolizaCheque?: number;

  @IsInt()
  ingresoEgreso: number;

  @IsOptional()
  @IsInt()
  idTransferencia?: number;

  @IsOptional()
  @IsInt()
  idSubsubcuenta?: number;

  @IsOptional()
  @IsString()
  subsubcuenta?: string;

  @IsOptional()
  @IsNumber()
  kg?: number;
}
