import { PartialType } from '@nestjs/mapped-types';
import { CreateEnvasesFrascosEncabezadoEntradasDto } from './create-envases-frascos-encabezado-entradas.dto';

export class UpdateEnvasesFrascosEncabezadoEntradasDto extends PartialType(CreateEnvasesFrascosEncabezadoEntradasDto) {}
