import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasDetalleNaranjoDto } from './create-cubetas-detalle-naranjo.dto';

export class UpdateCubetasDetalleNaranjoDto extends PartialType(CreateCubetasDetalleNaranjoDto) {}
