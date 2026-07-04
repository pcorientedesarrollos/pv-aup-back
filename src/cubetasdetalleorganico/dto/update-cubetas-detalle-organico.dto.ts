import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasDetalleOrganicoDto } from './create-cubetas-detalle-organico.dto';

export class UpdateCubetasDetalleOrganicoDto extends PartialType(CreateCubetasDetalleOrganicoDto) {}
