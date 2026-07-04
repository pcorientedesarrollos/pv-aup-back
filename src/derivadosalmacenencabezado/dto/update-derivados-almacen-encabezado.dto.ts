import { PartialType } from '@nestjs/mapped-types';
import { CreateDerivadosAlmacenEncabezadoDto } from './create-derivados-almacen-encabezado.dto';

export class UpdateDerivadosAlmacenEncabezadoDto extends PartialType(CreateDerivadosAlmacenEncabezadoDto) {}
