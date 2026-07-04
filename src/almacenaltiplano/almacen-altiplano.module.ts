import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenAltiplano } from './entities/almacen-altiplano.entity';
import { AlmacenAltiplanoService } from './almacen-altiplano.service';
import { AlmacenAltiplanoController } from './almacen-altiplano.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenAltiplano])],
  controllers: [AlmacenAltiplanoController],
  providers: [AlmacenAltiplanoService],
})
export class AlmacenAltiplanoModule {}
