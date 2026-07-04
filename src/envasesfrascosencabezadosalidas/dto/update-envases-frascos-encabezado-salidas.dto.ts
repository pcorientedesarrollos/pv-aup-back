import { PartialType } from '@nestjs/mapped-types';
import { CreateEnvasesFrascosEncabezadoSalidasDto } from './create-envases-frascos-encabezado-salidas.dto';

export class UpdateEnvasesFrascosEncabezadoSalidasDto extends PartialType(CreateEnvasesFrascosEncabezadoSalidasDto) {}
