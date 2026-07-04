import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoAguacate } from './entities/almacen-encabezado-aguacate.entity';
import { AlmacenEncabezadoAguacateService } from './almacen-encabezado-aguacate.service';
import { AlmacenEncabezadoAguacateController } from './almacen-encabezado-aguacate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoAguacate])],
  controllers: [AlmacenEncabezadoAguacateController],
  providers: [AlmacenEncabezadoAguacateService],
})
export class AlmacenEncabezadoAguacateModule {}
