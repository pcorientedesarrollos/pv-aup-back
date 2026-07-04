import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  tipo: string;

  @IsString()
  nombre: string;

  @IsInt()
  idComprador: number;

  @IsInt()
  idDatosFiscales: number;

  @IsInt()
  idDireccion: number;

  @IsString()
  idSagarpa: string;

  @IsInt()
  tipoDeMiel: number;

  @IsInt()
  empresa: number;

  @IsInt()
  cantidad: number;

  @IsInt()
  idEstado: number;

  @IsInt()
  activoInactivo: number;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsInt()
  deleteProve: number;
}
