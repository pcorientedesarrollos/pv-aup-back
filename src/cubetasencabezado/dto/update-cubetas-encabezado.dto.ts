import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasEncabezadoDto } from './create-cubetas-encabezado.dto';

export class UpdateCubetasEncabezadoDto extends PartialType(CreateCubetasEncabezadoDto) {}
