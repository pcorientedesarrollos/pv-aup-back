import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProformaDetalleDto {
  @IsNumber()
  @IsNotEmpty()
  idProducto!: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad!: number;

  @IsNumber()
  @IsNotEmpty()
  precioUnitario!: number;

  @IsNumber()
  @IsOptional()
  descuento?: number;

  @IsNumber()
  @IsOptional()
  totalIva?: number;
}

export class GenerarProformaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProformaDetalleDto)
  carrito!: ProformaDetalleDto[];

  @IsString()
  @IsOptional()
  nombreCliente?: string;
  
  @IsNumber()
  @IsOptional()
  descuento?: number;

  @IsNumber()
  @IsOptional()
  totalIva?: number;
  
  @IsNumber()
  @IsOptional()
  totalPagado?: number;
}
