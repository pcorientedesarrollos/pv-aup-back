import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasEncabezadoMantequillaDto } from './create-cubetas-encabezado-mantequilla.dto';

export class UpdateCubetasEncabezadoMantequillaDto extends PartialType(CreateCubetasEncabezadoMantequillaDto) {}
