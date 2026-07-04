import { PartialType } from '@nestjs/mapped-types';
import { CreateEnvasesFrascosDetalleEntradasDto } from './create-envases-frascos-detalle-entradas.dto';

export class UpdateEnvasesFrascosDetalleEntradasDto extends PartialType(CreateEnvasesFrascosDetalleEntradasDto) {}
