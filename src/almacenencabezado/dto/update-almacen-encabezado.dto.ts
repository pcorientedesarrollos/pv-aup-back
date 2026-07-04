import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoDto } from './create-almacen-encabezado.dto';

export class UpdateAlmacenEncabezadoDto extends PartialType(CreateAlmacenEncabezadoDto) {}
