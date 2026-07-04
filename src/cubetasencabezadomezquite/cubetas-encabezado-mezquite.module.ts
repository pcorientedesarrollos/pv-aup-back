import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasEncabezadoMezquite } from './entities/cubetas-encabezado-mezquite.entity';
import { CubetasEncabezadoMezquiteService } from './cubetas-encabezado-mezquite.service';
import { CubetasEncabezadoMezquiteController } from './cubetas-encabezado-mezquite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasEncabezadoMezquite])],
  controllers: [CubetasEncabezadoMezquiteController],
  providers: [CubetasEncabezadoMezquiteService],
})
export class CubetasEncabezadoMezquiteModule {}
