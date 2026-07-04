import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenApicolaDto } from './create-almacen-apicola.dto';

export class UpdateAlmacenApicolaDto extends PartialType(CreateAlmacenApicolaDto) {}
