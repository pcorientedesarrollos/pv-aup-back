import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoApicolaDto } from './create-almacen-encabezado-apicola.dto';

export class UpdateAlmacenEncabezadoApicolaDto extends PartialType(CreateAlmacenEncabezadoApicolaDto) {}
