import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasEncabezadoNaranjoDto } from './create-cubetas-encabezado-naranjo.dto';

export class UpdateCubetasEncabezadoNaranjoDto extends PartialType(CreateCubetasEncabezadoNaranjoDto) {}
