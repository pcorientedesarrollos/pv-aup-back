import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoAltiplano } from './entities/almacen-encabezado-altiplano.entity';
import { AlmacenEncabezadoAltiplanoService } from './almacen-encabezado-altiplano.service';
import { AlmacenEncabezadoAltiplanoController } from './almacen-encabezado-altiplano.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoAltiplano])],
  controllers: [AlmacenEncabezadoAltiplanoController],
  providers: [AlmacenEncabezadoAltiplanoService],
})
export class AlmacenEncabezadoAltiplanoModule {}
