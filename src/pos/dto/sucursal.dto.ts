import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EmpresaRefDto {
  @IsNotEmpty()
  idEmpresa!: string | number;
}

class UsuarioSucursalDto {
  @IsString()
  @IsNotEmpty()
  nombreUsuario!: string;

  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @IsString()
  @IsOptional()
  contrasena?: string;
}

export class CrearSucursalDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  ticketMsj?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EmpresaRefDto)
  empresa?: EmpresaRefDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => UsuarioSucursalDto)
  usuario?: UsuarioSucursalDto;
}

export class ActualizarSucursalDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  ticketMsj?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EmpresaRefDto)
  empresa?: EmpresaRefDto;
}
