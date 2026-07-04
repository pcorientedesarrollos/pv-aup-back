import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoAguacateDto } from './create-almacen-encabezado-aguacate.dto';

export class UpdateAlmacenEncabezadoAguacateDto extends PartialType(CreateAlmacenEncabezadoAguacateDto) {}
