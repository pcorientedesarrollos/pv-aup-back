import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasDetalleDto } from './create-cubetas-detalle.dto';

export class UpdateCubetasDetalleDto extends PartialType(CreateCubetasDetalleDto) {}
