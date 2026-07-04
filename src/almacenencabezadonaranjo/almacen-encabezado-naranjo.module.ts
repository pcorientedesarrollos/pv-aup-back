import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoNaranjo } from './entities/almacen-encabezado-naranjo.entity';
import { AlmacenEncabezadoNaranjoService } from './almacen-encabezado-naranjo.service';
import { AlmacenEncabezadoNaranjoController } from './almacen-encabezado-naranjo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoNaranjo])],
  controllers: [AlmacenEncabezadoNaranjoController],
  providers: [AlmacenEncabezadoNaranjoService],
})
export class AlmacenEncabezadoNaranjoModule {}
