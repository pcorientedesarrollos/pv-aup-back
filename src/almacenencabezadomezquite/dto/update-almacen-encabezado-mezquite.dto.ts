import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenEncabezadoMezquiteDto } from './create-almacen-encabezado-mezquite.dto';

export class UpdateAlmacenEncabezadoMezquiteDto extends PartialType(CreateAlmacenEncabezadoMezquiteDto) {}
