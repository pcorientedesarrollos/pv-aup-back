import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasDetalleAguacateDto } from './create-cubetas-detalle-aguacate.dto';

export class UpdateCubetasDetalleAguacateDto extends PartialType(CreateCubetasDetalleAguacateDto) {}
