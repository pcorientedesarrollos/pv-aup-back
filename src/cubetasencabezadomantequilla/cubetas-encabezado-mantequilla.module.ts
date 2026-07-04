import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasEncabezadoMantequilla } from './entities/cubetas-encabezado-mantequilla.entity';
import { CubetasEncabezadoMantequillaService } from './cubetas-encabezado-mantequilla.service';
import { CubetasEncabezadoMantequillaController } from './cubetas-encabezado-mantequilla.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasEncabezadoMantequilla])],
  controllers: [CubetasEncabezadoMantequillaController],
  providers: [CubetasEncabezadoMantequillaService],
})
export class CubetasEncabezadoMantequillaModule {}
