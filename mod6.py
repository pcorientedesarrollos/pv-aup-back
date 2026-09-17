import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
'''      // Obtener turno abierto
      const turno = await this.corteRepo.findOne({
        where: { usuario: { idUsuario }, estatus: 'Abierto' }
      });''',
'''      // Obtener turno abierto
      const turno = await this.corteRepo.findOne({
        where: { usuario: { sucursal: { idSucursal } }, estatus: 'Abierto' }
      });'''
)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
