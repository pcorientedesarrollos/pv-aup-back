import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenMezquite } from './entities/almacen-mezquite.entity';
import { AlmacenMezquiteService } from './almacen-mezquite.service';
import { AlmacenMezquiteController } from './almacen-mezquite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenMezquite])],
  controllers: [AlmacenMezquiteController],
  providers: [AlmacenMezquiteService],
})
export class AlmacenMezquiteModule {}
