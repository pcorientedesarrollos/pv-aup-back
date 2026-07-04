import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosUsuario } from '../pos/entities/pos-usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PosUsuario)
    private readonly usuarioRepository: Repository<PosUsuario>,
    private jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        nombreUsuario: dto.user,
        contrasenaHash: dto.password,
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = { username: usuario.nombreUsuario, sub: usuario.idUsuario, perfil: usuario.rol === 'Administrador' ? 1 : (usuario.rol === 'Soporte' ? 3 : 2) };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      idUsuario: usuario.idUsuario,
      usuario: usuario.nombreUsuario,
      idPerfil: usuario.rol === 'Administrador' ? 1 : (usuario.rol === 'Soporte' ? 3 : 2),
      app: 1,
    };
  }

  async bypass() {
    let usuario = await this.usuarioRepository.findOne({
      where: { activo: true, rol: 'Administrador' },
      relations: { sucursal: true },
      order: { idUsuario: 'ASC' }
    });

    if (!usuario) {
      // Si no hay admin, toma cualquiera
      usuario = await this.usuarioRepository.findOne({
        where: { activo: true },
        relations: { sucursal: true },
        order: { idUsuario: 'ASC' }
      });
    }

    if (!usuario) {
      throw new UnauthorizedException('No hay usuarios configurados en el sistema');
    }

    const payload = { username: usuario.nombreUsuario, sub: usuario.idUsuario, perfil: 1, sucursal: usuario.sucursal?.idSucursal }; 

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      idUsuario: usuario.idUsuario,
      usuario: usuario.nombreUsuario,
      idPerfil: 1, // Siempre Admin en Bypass para poder probar todo
      idSucursal: usuario.sucursal?.idSucursal || null,
      app: 1,
    };
  }
}
