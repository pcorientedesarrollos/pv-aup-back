import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenOrganicoDto } from './create-almacen-organico.dto';

export class UpdateAlmacenOrganicoDto extends PartialType(CreateAlmacenOrganicoDto) {}
