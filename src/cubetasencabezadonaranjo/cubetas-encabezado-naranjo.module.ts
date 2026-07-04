import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasEncabezadoNaranjo } from './entities/cubetas-encabezado-naranjo.entity';
import { CubetasEncabezadoNaranjoService } from './cubetas-encabezado-naranjo.service';
import { CubetasEncabezadoNaranjoController } from './cubetas-encabezado-naranjo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasEncabezadoNaranjo])],
  controllers: [CubetasEncabezadoNaranjoController],
  providers: [CubetasEncabezadoNaranjoService],
})
export class CubetasEncabezadoNaranjoModule {}
