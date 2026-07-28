import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
