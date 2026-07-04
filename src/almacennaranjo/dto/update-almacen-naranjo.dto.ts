import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenNaranjoDto } from './create-almacen-naranjo.dto';

export class UpdateAlmacenNaranjoDto extends PartialType(CreateAlmacenNaranjoDto) {}
