import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasDetalleMezquite } from './entities/cubetas-detalle-mezquite.entity';
import { CubetasDetalleMezquiteService } from './cubetas-detalle-mezquite.service';
import { CubetasDetalleMezquiteController } from './cubetas-detalle-mezquite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasDetalleMezquite])],
  controllers: [CubetasDetalleMezquiteController],
  providers: [CubetasDetalleMezquiteService],
})
export class CubetasDetalleMezquiteModule {}
