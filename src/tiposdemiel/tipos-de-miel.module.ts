import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposDeMiel } from './entities/tipos-de-miel.entity';
import { TiposDeMielService } from './tipos-de-miel.service';
import { TiposDeMielController } from './tipos-de-miel.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TiposDeMiel])],
  controllers: [TiposDeMielController],
  providers: [TiposDeMielService],
})
export class TiposDeMielModule {}
