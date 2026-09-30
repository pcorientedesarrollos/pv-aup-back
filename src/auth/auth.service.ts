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
      nombreCompleto: usuario.nombreCompleto,
      idPerfil: usuario.rol === 'Administrador' ? 1 : (usuario.rol === 'Soporte' ? 3 : 2),
      permisos: usuario.permisos || [],
      app: 1,
    };
  }

  }
