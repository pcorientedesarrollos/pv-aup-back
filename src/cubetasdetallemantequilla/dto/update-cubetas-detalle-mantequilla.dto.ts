import { PartialType } from '@nestjs/mapped-types';
import { CreateCubetasDetalleMantequillaDto } from './create-cubetas-detalle-mantequilla.dto';

export class UpdateCubetasDetalleMantequillaDto extends PartialType(CreateCubetasDetalleMantequillaDto) {}
