import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Autenticación POS
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

// Seguridad (Eliminado legacy)

// Finanzas (Eliminado legacy)

// Comercial (Eliminado legacy clientes)
import { ClientesExportadoresModule } from './clientesexportadores/clientesexportadores.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ProveedoresManttoModule } from './proveedoresmantto/proveedoresmantto.module';

// Geografía
import { LocalidadesModule } from './localidades/localidades.module';
import { DireccionModule } from './direccion/direccion.module';

// Caja Chica (Eliminado legacy)

// Bancos y Finanzas
import { BancosModule } from './bancos/bancos.module';
import { CuentasBancariasModule } from './cuentasbancarias/cuentasbancarias.module';
import { AuxiliarDeBancosModule } from './auxiliardebancos/auxiliardebancos.module';
import { RelacionDeMovimientosModule } from './relaciondemovimientos/relaciondemovimientos.module';

// Almacén Cera
import { AlmacenCeraModule } from './almacencera/almacencera.module';
import { AlmacenEncabezadoCeraModule } from './almacenencabezadocera/almacenencabezadocera.module';

// Almacén Apícola
import { AlmacenApicolaModule } from './almacenapicola/almacenapicola.module';
import { AlmacenEncabezadoApicolaModule } from './almacenencabezadoapicola/almacenencabezadoapicola.module';

// Derivados
import { DerivadosAlmacenDetalleModule } from './derivadosalmacendetalle/derivadosalmacendetalle.module';
import { DerivadosAlmacenDetalleSalidasModule } from './derivadosalmacendetallesalidas/derivadosalmacendetallesalidas.module';
import { DerivadosAlmacenEncabezadoModule } from './derivadosalmacenencabezado/derivadosalmacenencabezado.module';
import { DerivadosAlmacenEncabezadoSalidasModule } from './derivadosalmacenencabezadosalidas/derivadosalmacenencabezadosalidas.module';

// Envases y Frascos
import { EnvasesFrascosDetalleEntradasModule } from './envasesfrascosdetalleentradas/envasesfrascosdetalleentradas.module';
import { EnvasesFrascosDetalleSalidasModule } from './envasesfrascosdetallesalidas/envasesfrascosdetallesalidas.module';
import { EnvasesFrascosEncabezadoEntradasModule } from './envasesfrascosencabezadoentradas/envasesfrascosencabezadoentradas.module';
import { EnvasesFrascosEncabezadoSalidasModule } from './envasesfrascosencabezadosalidas/envasesfrascosencabezadosalidas.module';

// Almacén Miel General
import { AlmacenModule } from './almacen/almacen.module';
import { AlmacenEncabezadoModule } from './almacenencabezado/almacen-encabezado.module';

// Almacén Aguacate
import { AlmacenAguacateModule } from './almacenaguacate/almacen-aguacate.module';
import { AlmacenEncabezadoAguacateModule } from './almacenencabezadoaguacate/almacen-encabezado-aguacate.module';

// Almacén Altiplano
import { AlmacenAltiplanoModule } from './almacenaltiplano/almacen-altiplano.module';
import { AlmacenEncabezadoAltiplanoModule } from './almacenencabezadoaltiplano/almacen-encabezado-altiplano.module';

// Almacén Mantequilla
import { AlmacenMantequillaModule } from './almacenmantequilla/almacen-mantequilla.module';
import { AlmacenEncabezadoMantequillaModule } from './almacenencabezadomantequilla/almacen-encabezado-mantequilla.module';

// Almacén Mezquite
import { AlmacenMezquiteModule } from './almacenmezquite/almacen-mezquite.module';
import { AlmacenEncabezadoMezquiteModule } from './almacenencabezadomezquite/almacen-encabezado-mezquite.module';

// Almacén Naranjo
import { AlmacenNaranjoModule } from './almacennaranjo/almacen-naranjo.module';
import { AlmacenEncabezadoNaranjoModule } from './almacenencabezadonaranjo/almacen-encabezado-naranjo.module';

// Almacén Orgánico
import { AlmacenOrganicoModule } from './almacenorganico/almacen-organico.module';
import { AlmacenEncabezadoOrganicoModule } from './almacenencabezadoorganico/almacen-encabezado-organico.module';

// Cubetas General
import { CubetasEncabezadoModule } from './cubetasencabezado/cubetas-encabezado.module';
import { CubetasDetalleModule } from './cubetasdetalle/cubetas-detalle.module';

// Cubetas Aguacate
import { CubetasEncabezadoAguacateModule } from './cubetasencabezadoaguacate/cubetas-encabezado-aguacate.module';
import { CubetasDetalleAguacateModule } from './cubetasdetalleaguacate/cubetas-detalle-aguacate.module';

// Cubetas Altiplano
import { CubetasEncabezadoAltiplanoModule } from './cubetasencabezadoaltiplano/cubetas-encabezado-altiplano.module';
import { CubetasDetalleAltiplanoModule } from './cubetasdetallealtiplano/cubetas-detalle-altiplano.module';

// Cubetas Mantequilla
import { CubetasEncabezadoMantequillaModule } from './cubetasencabezadomantequilla/cubetas-encabezado-mantequilla.module';
import { CubetasDetalleMantequillaModule } from './cubetasdetallemantequilla/cubetas-detalle-mantequilla.module';

// Cubetas Mezquite
import { CubetasEncabezadoMezquiteModule } from './cubetasencabezadomezquite/cubetas-encabezado-mezquite.module';
import { CubetasDetalleMezquiteModule } from './cubetasdetallemezquite/cubetas-detalle-mezquite.module';

// Cubetas Naranjo
import { CubetasEncabezadoNaranjoModule } from './cubetasencabezadonaranjo/cubetas-encabezado-naranjo.module';
import { CubetasDetalleNaranjoModule } from './cubetasdetallenaranjo/cubetas-detalle-naranjo.module';

// Cubetas Orgánico
import { CubetasEncabezadoOrganicoModule } from './cubetasencabezadoorganico/cubetas-encabezado-organico.module';
import { CubetasDetalleOrganicoModule } from './cubetasdetalleorganico/cubetas-detalle-organico.module';

// Catálogos
import { TiposDeMielModule } from './tiposdemiel/tipos-de-miel.module';
import { ProductosModule } from './productos/productos.module';

// Sincronizador de Inventarios (Eliminado legacy)
import { DashboardModule } from './dashboard/dashboard.module';
import { PosModule } from './pos/pos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE') || 'mysql',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USER') || 'root',
        password: configService.get<string>('DB_PASSWORD') || '',
        database: configService.get<string>('DB_NAME') || 'apicultores2026_dev',
        autoLoadEntities: true,
        synchronize: true,
        extra: {
          enableKeepAlive: true,
          connectionLimit: 10
        }
      }),
    }),
    // Autenticación POS
    AuthModule,
    // Seguridad (Eliminado)
    // Finanzas (Eliminado)
    // Comercial
    ClientesExportadoresModule,
    ProveedorModule,
    ProveedoresManttoModule,
    // Geografía
    LocalidadesModule,
    DireccionModule,
    // Caja Chica (Eliminado)
    // Bancos y Finanzas
    BancosModule,
    CuentasBancariasModule,
    AuxiliarDeBancosModule,
    RelacionDeMovimientosModule,
    // Almacén Cera
    AlmacenCeraModule,
    AlmacenEncabezadoCeraModule,
    // Almacén Apícola
    AlmacenApicolaModule,
    AlmacenEncabezadoApicolaModule,
    // Derivados
    DerivadosAlmacenDetalleModule,
    DerivadosAlmacenDetalleSalidasModule,
    DerivadosAlmacenEncabezadoModule,
    DerivadosAlmacenEncabezadoSalidasModule,
    // Envases y Frascos
    EnvasesFrascosDetalleEntradasModule,
    EnvasesFrascosDetalleSalidasModule,
    EnvasesFrascosEncabezadoEntradasModule,
    EnvasesFrascosEncabezadoSalidasModule,
    // Almacén Miel General
    AlmacenModule,
    AlmacenEncabezadoModule,
    // Almacén Aguacate
    AlmacenAguacateModule,
    AlmacenEncabezadoAguacateModule,
    // Almacén Altiplano
    AlmacenAltiplanoModule,
    AlmacenEncabezadoAltiplanoModule,
    // Almacén Mantequilla
    AlmacenMantequillaModule,
    AlmacenEncabezadoMantequillaModule,
    // Almacén Mezquite
    AlmacenMezquiteModule,
    AlmacenEncabezadoMezquiteModule,
    // Almacén Naranjo
    AlmacenNaranjoModule,
    AlmacenEncabezadoNaranjoModule,
    // Almacén Orgánico
    AlmacenOrganicoModule,
    AlmacenEncabezadoOrganicoModule,
    // Cubetas General
    CubetasEncabezadoModule,
    CubetasDetalleModule,
    // Cubetas Aguacate
    CubetasEncabezadoAguacateModule,
    CubetasDetalleAguacateModule,
    // Cubetas Altiplano
    CubetasEncabezadoAltiplanoModule,
    CubetasDetalleAltiplanoModule,
    // Cubetas Mantequilla
    CubetasEncabezadoMantequillaModule,
    CubetasDetalleMantequillaModule,
    // Cubetas Mezquite
    CubetasEncabezadoMezquiteModule,
    CubetasDetalleMezquiteModule,
    // Cubetas Naranjo
    CubetasEncabezadoNaranjoModule,
    CubetasDetalleNaranjoModule,
    // Cubetas Orgánico
    CubetasEncabezadoOrganicoModule,
    CubetasDetalleOrganicoModule,
    // Catálogos
    TiposDeMielModule,
    ProductosModule,
    DashboardModule,
    PosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
