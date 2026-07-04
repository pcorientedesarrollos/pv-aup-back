import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenOrganico } from './entities/almacen-organico.entity';
import { AlmacenOrganicoService } from './almacen-organico.service';
import { AlmacenOrganicoController } from './almacen-organico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenOrganico])],
  controllers: [AlmacenOrganicoController],
  providers: [AlmacenOrganicoService],
})
export class AlmacenOrganicoModule {}
