import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoCeraDto } from './create-almacen-encabezado-cera.dto';

export class UpdateAlmacenEncabezadoCeraDto extends PartialType(CreateAlmacenEncabezadoCeraDto) {}
