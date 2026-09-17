import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
'''  async getAllCortes(idSucursal?: number) {
    if (!idSucursal) return []; // Forzar a que siempre reciba una sucursal

    return this.corteRepo.find({
      where: {
        sucursal: { idSucursal },
        usuario: { rol: Not('Soporte') }
      },''',
'''  async getAllCortes(idSucursal?: number) {
    if (!idSucursal) return []; // Forzar a que siempre reciba una sucursal

    return this.corteRepo.find({
      where: [
        { sucursal: { idSucursal }, usuario: { rol: Not('Soporte') } },
        { usuario: { sucursal: { idSucursal }, rol: Not('Soporte') } }
      ],'''
)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
