import { PartialType } from '@nestjs/mapped-types';
import { CreateEnvasesFrascosDetalleSalidasDto } from './create-envases-frascos-detalle-salidas.dto';

export class UpdateEnvasesFrascosDetalleSalidasDto extends PartialType(CreateEnvasesFrascosDetalleSalidasDto) {}
