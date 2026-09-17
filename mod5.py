import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update abrirTurno to check for branch turn
text = text.replace(
'''    const corteExistente = await this.corteRepo.findOne({
      where: { usuario: { idUsuario: payload.idUsuario }, estatus: 'Abierto' }
    });''',
'''    const corteExistente = await this.corteRepo.findOne({
      where: { usuario: { sucursal: { idSucursal: usuario.sucursal?.idSucursal || 1 } }, estatus: 'Abierto' }
    });'''
)

# 2. Update getTurnoActivo
text = text.replace(
'''  async getTurnoActivo(idUsuario: number) {
    return this.corteRepo.findOne({
      where: { usuario: { idUsuario }, estatus: 'Abierto' }
    });
  }''',
'''  async getTurnoActivo(idUsuario: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { idUsuario }, relations: { sucursal: true } });
    if (!usuario) return null;
    return this.corteRepo.findOne({
      where: { usuario: { sucursal: { idSucursal: usuario.sucursal?.idSucursal || 1 } }, estatus: 'Abierto' }
    });
  }'''
)

# 3. Update checkout
text = text.replace(
'''      const turno = await queryRunner.manager.findOne(PosCorteCaja, { 
        where: { usuario: { idUsuario: payload.idUsuario }, estatus: 'Abierto' } 
      });''',
'''      const u = await queryRunner.manager.findOne(PosUsuario, { where: { idUsuario: payload.idUsuario }, relations: { sucursal: true } });
      const turno = await queryRunner.manager.findOne(PosCorteCaja, { 
        where: { usuario: { sucursal: { idSucursal: u?.sucursal?.idSucursal || 1 } }, estatus: 'Abierto' } 
      });'''
)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
