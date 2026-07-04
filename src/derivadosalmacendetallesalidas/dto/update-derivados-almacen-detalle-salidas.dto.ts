import { PartialType } from '@nestjs/mapped-types';
import { CreateDerivadosAlmacenDetalleSalidasDto } from './create-derivados-almacen-detalle-salidas.dto';

export class UpdateDerivadosAlmacenDetalleSalidasDto extends PartialType(CreateDerivadosAlmacenDetalleSalidasDto) {}
