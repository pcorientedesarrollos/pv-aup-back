import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasDetalleAltiplanoDto } from './create-cubetas-detalle-altiplano.dto';

export class UpdateCubetasDetalleAltiplanoDto extends PartialType(CreateCubetasDetalleAltiplanoDto) {}
