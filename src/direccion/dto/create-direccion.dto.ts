import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDireccionDto {
  @IsString()
  calle: string;

  @IsString()
  numeroExterior: string;

  @IsOptional()
  @IsString()
  numeroInterior?: string;

  @IsString()
  cruzamientos: string;

  @IsInt()
  idEstado: number;

  @IsInt()
  idlocalidad: number;

  @IsString()
  codigoPostal: string;

  @IsString()
  colonia: string;

  @IsString()
  direccionCompleta: string;
}
