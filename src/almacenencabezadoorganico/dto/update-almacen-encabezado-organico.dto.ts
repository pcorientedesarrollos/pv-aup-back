import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoOrganicoDto } from './create-almacen-encabezado-organico.dto';

export class UpdateAlmacenEncabezadoOrganicoDto extends PartialType(CreateAlmacenEncabezadoOrganicoDto) {}
