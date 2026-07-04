import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuxiliarBanco } from './entities/auxiliar-banco.entity';
import { AuxiliarDeBancosService } from './auxiliardebancos.service';
import { AuxiliarDeBancosController } from './auxiliardebancos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuxiliarBanco])],
  controllers: [AuxiliarDeBancosController],
  providers: [AuxiliarDeBancosService],
})
export class AuxiliarDeBancosModule {}
