import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezado } from './entities/almacen-encabezado.entity';
import { AlmacenEncabezadoService } from './almacen-encabezado.service';
import { AlmacenEncabezadoController } from './almacen-encabezado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezado])],
  controllers: [AlmacenEncabezadoController],
  providers: [AlmacenEncabezadoService],
})
export class AlmacenEncabezadoModule {}
