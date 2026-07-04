import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasDetalleNaranjo } from './entities/cubetas-detalle-naranjo.entity';
import { CubetasDetalleNaranjoService } from './cubetas-detalle-naranjo.service';
import { CubetasDetalleNaranjoController } from './cubetas-detalle-naranjo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasDetalleNaranjo])],
  controllers: [CubetasDetalleNaranjoController],
  providers: [CubetasDetalleNaranjoService],
})
export class CubetasDetalleNaranjoModule {}
