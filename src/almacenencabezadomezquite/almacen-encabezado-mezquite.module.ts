import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenEncabezadoMezquite } from './entities/almacen-encabezado-mezquite.entity';
import { AlmacenEncabezadoMezquiteService } from './almacen-encabezado-mezquite.service';
import { AlmacenEncabezadoMezquiteController } from './almacen-encabezado-mezquite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenEncabezadoMezquite])],
  controllers: [AlmacenEncabezadoMezquiteController],
  providers: [AlmacenEncabezadoMezquiteService],
})
export class AlmacenEncabezadoMezquiteModule {}
