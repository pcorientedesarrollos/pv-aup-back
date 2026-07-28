import sys
import re
with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'(async facturarVenta\(.*?)(\s*// --- CAT[AÁ]LOGOS SAT ---)', content, re.DOTALL)
if match:
    new_func = '''async facturarVenta(idVenta: number, payload: { rfc: string, razonSocial: string, cp: string, regimen: string, usoCfdi: string, formaPago?: string, metodoPago?: string }) {
    const venta = await this.ventaRepo.findOne({
      where: { idVenta },
      relations: { detalles: { producto: true }, sucursal: true }
    });

    if (!venta) throw new BadRequestException('Venta no encontrada');
    if (venta.estatus === 'Cancelada' || venta.estatus === 'Devuelta' || venta.estatus === 'Dev. Parcial') {
      throw new BadRequestException(`No se puede facturar una venta con estatus "${venta.estatus}"`);
    }

    const existe = await this.facturaRepo.findOne({ where: { venta: { idVenta } } });
    if (existe && existe.estatus === 'Emitida') {
      throw new BadRequestException('Esta venta ya fue facturada');
    }

    console.log('Facturama: Simulando Facturacion API...', payload);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const nuevaFactura = this.facturaRepo.create({
      venta,
      rfcCliente: payload.rfc,
      nombreCliente: payload.razonSocial,
      usoCfdi: payload.usoCfdi,
      total: venta.totalPagado,
      sucursal: venta.sucursal,
      uuid: 'FACTURAMA-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      urlPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      urlXml: '#',
      estatus: 'Emitida',
      fechaEmision: new Date()
    });

    return await this.facturaRepo.save(nuevaFactura);
  }
'''
    content = content[:match.start(1)] + new_func + content[match.start(2):]
    with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed pos.service.ts!')
else:
    print('Could not find facturarVenta block')
