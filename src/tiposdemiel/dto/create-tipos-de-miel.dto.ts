import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTiposDeMielDto {
  @IsString()
  tipoDeMiel: string;

  @IsOptional()
  @IsInt()
  orden?: number;
}
