import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasEncabezado } from './entities/cubetas-encabezado.entity';
import { CubetasEncabezadoService } from './cubetas-encabezado.service';
import { CubetasEncabezadoController } from './cubetas-encabezado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasEncabezado])],
  controllers: [CubetasEncabezadoController],
  providers: [CubetasEncabezadoService],
})
export class CubetasEncabezadoModule {}
