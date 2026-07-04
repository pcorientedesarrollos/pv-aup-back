import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoOrganico } from './entities/almacen-encabezado-organico.entity';
import { AlmacenEncabezadoOrganicoService } from './almacen-encabezado-organico.service';
import { AlmacenEncabezadoOrganicoController } from './almacen-encabezado-organico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoOrganico])],
  controllers: [AlmacenEncabezadoOrganicoController],
  providers: [AlmacenEncabezadoOrganicoService],
})
export class AlmacenEncabezadoOrganicoModule {}
