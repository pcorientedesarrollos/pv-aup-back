import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber } from 'class-validator';

export class ClienteDto {
  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  rfc?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  cp?: string;

  @IsString()
  @IsOptional()
  regimenFiscal?: string;
  
  @IsNumber()
  @IsOptional()
  limiteCredito?: number;
}
