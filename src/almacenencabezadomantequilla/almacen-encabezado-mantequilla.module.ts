import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoMantequilla } from './entities/almacen-encabezado-mantequilla.entity';
import { AlmacenEncabezadoMantequillaService } from './almacen-encabezado-mantequilla.service';
import { AlmacenEncabezadoMantequillaController } from './almacen-encabezado-mantequilla.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoMantequilla])],
  controllers: [AlmacenEncabezadoMantequillaController],
  providers: [AlmacenEncabezadoMantequillaService],
})
export class AlmacenEncabezadoMantequillaModule {}
