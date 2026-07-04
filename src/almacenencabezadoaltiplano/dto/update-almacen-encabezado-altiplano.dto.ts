import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoAltiplanoDto } from './create-almacen-encabezado-altiplano.dto';

export class UpdateAlmacenEncabezadoAltiplanoDto extends PartialType(CreateAlmacenEncabezadoAltiplanoDto) {}
