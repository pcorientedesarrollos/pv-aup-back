import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoMantequillaDto } from './create-almacen-encabezado-mantequilla.dto';

export class UpdateAlmacenEncabezadoMantequillaDto extends PartialType(CreateAlmacenEncabezadoMantequillaDto) {}
