import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VentaDetalleDto {
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

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentaDetalleDto)
  carrito!: VentaDetalleDto[];

  @IsNumber()
  @IsNotEmpty()
  totalPagado!: number;

  @IsNumber()
  @IsOptional()
  descuento?: number;

  @IsNumber()
  @IsOptional()
  totalIva?: number;

  @IsString()
  @IsOptional()
  metodoPago?: string;
  
  @IsNumber()
  @IsOptional()
  idCliente?: number;

  @IsNumber()
  @IsNotEmpty()
  idSucursal!: number;
  
  @IsNumber()
  @IsNotEmpty()
  idUsuario!: number;

  @IsNumber()
  @IsOptional()
  efectivoRecibido?: number;
  
  @IsNumber()
  @IsOptional()
  cambioEntregado?: number;
}
