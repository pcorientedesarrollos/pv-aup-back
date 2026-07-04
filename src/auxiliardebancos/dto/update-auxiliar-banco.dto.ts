import { PartialType } from '@nestjs/mapped-types';
import { CreateAuxiliarBancoDto } from './create-auxiliar-banco.dto';

export class UpdateAuxiliarBancoDto extends PartialType(CreateAuxiliarBancoDto) {}
