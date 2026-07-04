import { PartialType } from '@nestjs/mapped-types';
import { CreateTiposDeMielDto } from './create-tipos-de-miel.dto';

export class UpdateTiposDeMielDto extends PartialType(CreateTiposDeMielDto) {}
