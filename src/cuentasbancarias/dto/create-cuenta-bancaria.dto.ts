import { IsInt, IsString } from 'class-validator';

export class CreateCuentaBancariaDto {
  @IsString()
  numDeCuenta: string;

  @IsInt()
  idBanco: number;

  @IsInt()
  moneda: number;
}
