import { IsInt, IsString } from 'class-validator';

export class CreateLocalidadDto {
  @IsString()
  localidad: string;

  @IsInt()
  idzona: number;

  @IsInt()
  estado: number;

  @IsInt()
  idEstado: number;
}
