import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extraer el usuario autenticado desde el JWT token.
 * Uso: @CurrentUser() user: { idUsuario, usuario, rol, idSucursal, idEmpresa }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
