import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UsuarioDto {
  @IsString()
  @IsNotEmpty()
  usuario!: string;

  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  rol?: string;
  
  @IsNumber()
  @IsOptional()
  idPerfil?: number;

  @IsBoolean()
  @IsOptional()
  oculto?: boolean;

  @IsOptional()
  permisos?: string[];

  @IsNumber()
  @IsOptional()
  idSucursal?: number;
}
