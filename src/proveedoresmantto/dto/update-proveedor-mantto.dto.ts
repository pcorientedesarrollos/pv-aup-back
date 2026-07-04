import { PartialType } from '@nestjs/mapped-types';
import { CreateProveedorManttoDto } from './create-proveedor-mantto.dto';

export class UpdateProveedorManttoDto extends PartialType(CreateProveedorManttoDto) {}
