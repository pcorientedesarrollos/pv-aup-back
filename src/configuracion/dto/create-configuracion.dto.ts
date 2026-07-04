import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateConfiguracionDto {
  @IsString()
  nombreNegocio: string;

  @IsString()
  @IsOptional()
  direccion: string;

  @IsString()
  @IsOptional()
  telefono: string;

  @IsString()
  @IsOptional()
  rfc: string;

  @IsString()
  @IsOptional()
  mensajeTicket: string;

  @IsString()
  @IsOptional()
  anchoTicket: string;

  @IsBoolean()
  @IsOptional()
  imprimirLogo: boolean;
}
