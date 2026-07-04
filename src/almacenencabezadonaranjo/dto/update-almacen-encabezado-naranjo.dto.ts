import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoNaranjoDto } from './create-almacen-encabezado-naranjo.dto';

export class UpdateAlmacenEncabezadoNaranjoDto extends PartialType(CreateAlmacenEncabezadoNaranjoDto) {}
