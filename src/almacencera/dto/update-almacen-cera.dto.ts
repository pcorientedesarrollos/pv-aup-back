import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenCeraDto } from './create-almacen-cera.dto';

export class UpdateAlmacenCeraDto extends PartialType(CreateAlmacenCeraDto) {}
