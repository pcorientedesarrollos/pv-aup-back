import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasEncabezadoAltiplanoDto } from './create-cubetas-encabezado-altiplano.dto';

export class UpdateCubetasEncabezadoAltiplanoDto extends PartialType(CreateCubetasEncabezadoAltiplanoDto) {}
