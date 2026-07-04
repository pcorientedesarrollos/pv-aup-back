import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenAguacate } from './entities/almacen-aguacate.entity';
import { AlmacenAguacateService } from './almacen-aguacate.service';
import { AlmacenAguacateController } from './almacen-aguacate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenAguacate])],
  controllers: [AlmacenAguacateController],
  providers: [AlmacenAguacateService],
})
export class AlmacenAguacateModule {}
