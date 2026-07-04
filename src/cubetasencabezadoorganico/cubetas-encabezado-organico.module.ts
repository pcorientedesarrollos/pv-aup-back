import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasEncabezadoOrganico } from './entities/cubetas-encabezado-organico.entity';
import { CubetasEncabezadoOrganicoService } from './cubetas-encabezado-organico.service';
import { CubetasEncabezadoOrganicoController } from './cubetas-encabezado-organico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasEncabezadoOrganico])],
  controllers: [CubetasEncabezadoOrganicoController],
  providers: [CubetasEncabezadoOrganicoService],
})
export class CubetasEncabezadoOrganicoModule {}
