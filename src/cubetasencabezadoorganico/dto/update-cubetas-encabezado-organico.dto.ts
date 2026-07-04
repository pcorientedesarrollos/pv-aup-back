import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasEncabezadoOrganicoDto } from './create-cubetas-encabezado-organico.dto';

export class UpdateCubetasEncabezadoOrganicoDto extends PartialType(CreateCubetasEncabezadoOrganicoDto) {}
