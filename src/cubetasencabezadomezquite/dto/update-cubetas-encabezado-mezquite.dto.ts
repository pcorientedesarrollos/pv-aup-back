import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasEncabezadoMezquiteDto } from './create-cubetas-encabezado-mezquite.dto';

export class UpdateCubetasEncabezadoMezquiteDto extends PartialType(CreateCubetasEncabezadoMezquiteDto) {}
