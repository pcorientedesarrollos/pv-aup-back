import { PartialType } from '@nestjs/mapped-types';
import { CreateDerivadosAlmacenDetalleDto } from './create-derivados-almacen-detalle.dto';

export class UpdateDerivadosAlmacenDetalleDto extends PartialType(CreateDerivadosAlmacenDetalleDto) {}
