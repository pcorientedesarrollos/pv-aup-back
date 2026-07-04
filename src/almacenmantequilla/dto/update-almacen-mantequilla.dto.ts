import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenMantequillaDto } from './create-almacen-mantequilla.dto';

export class UpdateAlmacenMantequillaDto extends PartialType(CreateAlmacenMantequillaDto) {}
