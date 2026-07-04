import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasDetalleMantequilla } from './entities/cubetas-detalle-mantequilla.entity';
import { CubetasDetalleMantequillaService } from './cubetas-detalle-mantequilla.service';
import { CubetasDetalleMantequillaController } from './cubetas-detalle-mantequilla.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasDetalleMantequilla])],
  controllers: [CubetasDetalleMantequillaController],
  providers: [CubetasDetalleMantequillaService],
})
export class CubetasDetalleMantequillaModule {}
