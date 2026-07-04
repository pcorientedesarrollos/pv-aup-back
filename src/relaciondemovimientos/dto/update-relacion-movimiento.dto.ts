import { PartialType } from '@nestjs/mapped-types';
import { CreateRelacionMovimientoDto } from './create-relacion-movimiento.dto';

export class UpdateRelacionMovimientoDto extends PartialType(CreateRelacionMovimientoDto) {}
