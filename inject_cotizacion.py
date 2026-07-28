import os
with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_method = '''
  async getCotizacionById(idCotizacion: number) {
    const cotizacion = await this.cotizacionRepo.findOne({
      where: { idCotizacion },
      relations: { detalles: { producto: true }, cliente: true, usuario: true, sucursal: true }
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    return cotizacion;
  }
'''

if 'getCotizacionById' not in content:
    content = content.replace('async cambiarEstatusCotizacion', new_method + '\n  async cambiarEstatusCotizacion')
    with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("getCotizacionById injected")
