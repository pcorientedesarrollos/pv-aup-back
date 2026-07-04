import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasDetalleOrganico } from './entities/cubetas-detalle-organico.entity';
import { CubetasDetalleOrganicoService } from './cubetas-detalle-organico.service';
import { CubetasDetalleOrganicoController } from './cubetas-detalle-organico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasDetalleOrganico])],
  controllers: [CubetasDetalleOrganicoController],
  providers: [CubetasDetalleOrganicoService],
})
export class CubetasDetalleOrganicoModule {}
