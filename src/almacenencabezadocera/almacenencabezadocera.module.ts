import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoCera } from './entities/almacen-encabezado-cera.entity';
import { AlmacenEncabezadoCeraService } from './almacenencabezadocera.service';
import { AlmacenEncabezadoCeraController } from './almacenencabezadocera.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoCera])],
  controllers: [AlmacenEncabezadoCeraController],
  providers: [AlmacenEncabezadoCeraService],
})
export class AlmacenEncabezadoCeraModule {}
