import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoApicola } from './entities/almacen-encabezado-apicola.entity';
import { AlmacenEncabezadoApicolaService } from './almacenencabezadoapicola.service';
import { AlmacenEncabezadoApicolaController } from './almacenencabezadoapicola.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoApicola])],
  controllers: [AlmacenEncabezadoApicolaController],
  providers: [AlmacenEncabezadoApicolaService],
})
export class AlmacenEncabezadoApicolaModule {}
