import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { PosUsuario } from '../pos/entities/pos-usuario.entity';

// ---------------------------------------------------------------------------
// Helpers para crear mocks reutilizables
// ---------------------------------------------------------------------------

/** Devuelve un usuario simulado con todos los campos mínimos necesarios. */
function makeUsuario(overrides: Partial<PosUsuario> = {}): PosUsuario {
  return {
    idUsuario: 1,
    nombreUsuario: 'admin',
    contrasenaHash: 'plainPassword123', // contraseña en texto plano (formato legacy)
    nombreCompleto: 'Administrador Test',
    rol: 'Administrador',
    activo: true,
    permisos: [],
    sucursal: null as any,
    ...overrides,
  } as PosUsuario;
}

/** Fábrica del mock del repositorio de PosUsuario. */
function makeRepoMock(usuario: PosUsuario | null) {
  return {
    findOne: jest.fn().mockResolvedValue(usuario),
    save: jest.fn().mockResolvedValue(usuario),
  };
}

/** Fábrica del mock de JwtService. */
function makeJwtMock() {
  return { sign: jest.fn().mockReturnValue('mock-jwt-token-xyz') };
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

describe('AuthService', () => {
  let service: AuthService;
  let repoMock: ReturnType<typeof makeRepoMock>;
  let jwtMock: ReturnType<typeof makeJwtMock>;

  /**
   * Construye el módulo de prueba antes de cada caso.
   * El parámetro `usuario` controla qué devolverá el repositorio.
   */
  async function buildModule(usuario: PosUsuario | null) {
    repoMock = makeRepoMock(usuario);
    jwtMock = makeJwtMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(PosUsuario), useValue: repoMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  }

  // -------------------------------------------------------------------------
  // login — casos exitosos
  // -------------------------------------------------------------------------
  describe('login()', () => {
    describe('con credenciales correctas (contraseña legacy en texto plano)', () => {
      beforeEach(() => buildModule(makeUsuario()));

      it('debería retornar access_token cuando las credenciales son válidas', async () => {
        const result = await service.login({ user: 'admin', password: 'plainPassword123' });
        expect(result.access_token).toBe('mock-jwt-token-xyz');
      });

      it('debería incluir idUsuario en la respuesta', async () => {
        const result = await service.login({ user: 'admin', password: 'plainPassword123' });
        expect(result.idUsuario).toBe(1);
      });

      it('debería generar el JWT con el servicio de JwtService', async () => {
        await service.login({ user: 'admin', password: 'plainPassword123' });
        expect(jwtMock.sign).toHaveBeenCalledTimes(1);
      });
    });

    // -----------------------------------------------------------------------
    // login — casos de error
    // -----------------------------------------------------------------------
    describe('con usuario inexistente', () => {
      beforeEach(() => buildModule(null)); // repo devuelve null → usuario no existe

      it('debería lanzar UnauthorizedException', async () => {
        await expect(
          service.login({ user: 'noexiste', password: '123' }),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('no debería firmar ningún JWT', async () => {
        await service.login({ user: 'noexiste', password: '123' }).catch(() => null);
        expect(jwtMock.sign).not.toHaveBeenCalled();
      });
    });

    describe('con contraseña incorrecta (usuario activo, contraseña legacy)', () => {
      // En auth.service.ts la comparación de contraseña la hace la BD en el WHERE.
      // Una contraseña incorrecta → findOne devuelve null → UnauthorizedException.
      beforeEach(() => buildModule(null));

      it('debería lanzar UnauthorizedException cuando la contraseña no coincide', async () => {
        await expect(
          service.login({ user: 'admin', password: 'wrongPassword' }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('con usuario inactivo', () => {
      beforeEach(() => buildModule(makeUsuario({ activo: false })));

      it('debería lanzar UnauthorizedException porque el usuario está inactivo', async () => {
        // El AuthService busca con where: { activo: true }, pero aquí probamos
        // que si el repo simulado devuelve un usuario inactivo, se rechaza igual.
        // En producción el repo filtraría directamente, pero aquí cubrimos el guard.
        await expect(
          service.login({ user: 'admin', password: 'plainPassword123' }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  // -------------------------------------------------------------------------
  // bypass — casos exitosos
  // -------------------------------------------------------------------------
  describe('bypass()', () => {
    describe('cuando existe al menos un administrador activo', () => {
      beforeEach(() => buildModule(makeUsuario({ sucursal: { idSucursal: 5 } as any })));

      it('debería retornar access_token', async () => {
        const result = await service.bypass();
        expect(result.access_token).toBeDefined();
        expect(typeof result.access_token).toBe('string');
      });

      it('debería asignar idPerfil = 1 (Administrador)', async () => {
        const result = await service.bypass();
        expect(result.idPerfil).toBe(1);
      });
    });

    describe('cuando no hay ningún usuario en el sistema', () => {
      beforeEach(() => buildModule(null));

      it('debería lanzar UnauthorizedException', async () => {
        await expect(service.bypass()).rejects.toThrow(UnauthorizedException);
      });
    });
  });
});
