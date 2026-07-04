import { IsDateString, IsInt, IsString } from 'class-validator';

export class CreateProveedorManttoDto {
  @IsInt()
  idArea: number;

  @IsDateString()
  fechaRegistro: string;

  @IsString()
  nombreProveedor: string;

  @IsString()
  nombreContacto: string;

  @IsInt()
  idTipoProveedor: number;

  @IsString()
  insumo: string;

  @IsString()
  domicilio: string;

  @IsString()
  telefono: string;

  @IsString()
  correo: string;

  @IsString()
  web: string;

  @IsString()
  estatus: string;

  @IsString()
  credito: string;
}
