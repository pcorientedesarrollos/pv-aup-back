import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteExportadorDto } from './create-cliente-exportador.dto';

export class UpdateClienteExportadorDto extends PartialType(CreateClienteExportadorDto) {}
