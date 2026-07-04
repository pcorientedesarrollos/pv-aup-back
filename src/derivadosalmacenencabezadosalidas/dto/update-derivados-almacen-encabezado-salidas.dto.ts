import { PartialType } from '@nestjs/mapped-types';
import { CreateDerivadosAlmacenEncabezadoSalidasDto } from './create-derivados-almacen-encabezado-salidas.dto';

export class UpdateDerivadosAlmacenEncabezadoSalidasDto extends PartialType(CreateDerivadosAlmacenEncabezadoSalidasDto) {}
