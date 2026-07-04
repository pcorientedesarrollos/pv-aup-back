import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasEncabezadoAguacateDto } from './create-cubetas-encabezado-aguacate.dto';

export class UpdateCubetasEncabezadoAguacateDto extends PartialType(CreateCubetasEncabezadoAguacateDto) {}
