import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenAltiplanoDto } from './create-almacen-altiplano.dto';

export class UpdateAlmacenAltiplanoDto extends PartialType(CreateAlmacenAltiplanoDto) {}
