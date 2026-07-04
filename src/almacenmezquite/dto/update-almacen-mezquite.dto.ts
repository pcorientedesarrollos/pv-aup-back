import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmacenMezquiteDto } from './create-almacen-mezquite.dto';

export class UpdateAlmacenMezquiteDto extends PartialType(CreateAlmacenMezquiteDto) {}
