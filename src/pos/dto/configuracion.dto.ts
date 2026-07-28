import { IsOptional, IsNumber, IsString } from 'class-validator';

export class ConfiguracionDto {
  @IsNumber()
  @IsOptional()
  porcentajeIva?: number;

  @IsString()
  @IsOptional()
  impresoraTicket?: string;
  
  @IsString()
  @IsOptional()
  leyendaTicket?: string;
}
