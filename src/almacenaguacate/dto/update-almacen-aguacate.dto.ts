import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenAguacateDto } from './create-almacen-aguacate.dto';

export class UpdateAlmacenAguacateDto extends PartialType(CreateAlmacenAguacateDto) {}
