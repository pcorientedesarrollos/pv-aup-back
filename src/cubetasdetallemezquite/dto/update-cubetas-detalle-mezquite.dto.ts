import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasDetalleMezquiteDto } from './create-cubetas-detalle-mezquite.dto';

export class UpdateCubetasDetalleMezquiteDto extends PartialType(CreateCubetasDetalleMezquiteDto) {}
