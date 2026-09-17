import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'const totalGastos = Number(sumasGastos?.totalgastos || sumasGastos?.totalGastos || 0);'
insertion = '''
    let compras = [];
    if (corte.fechaApertura) {
      const fechaCierre = corte.fechaCierre || new Date();
      compras = await this.compraRepo.find({
        where: {
          sucursal: { idSucursal: corte.usuario?.sucursal?.idSucursal || corte.usuario?.idSucursal || 1 },
          fechaCompra: Between(corte.fechaApertura, fechaCierre)
        },
        relations: { proveedor: true },
        order: { fechaCompra: 'DESC' }, take: 100
      });
    }
'''

text = text.replace(target, insertion + '\n    ' + target)
text = text.replace('ventas: ventasList,', 'ventas: ventasList,\n        compras,')
text = text.replace('import { Repository, Not }', 'import { Repository, Not, Between }')
text = text.replace('import { Repository, IsNull, Not }', 'import { Repository, IsNull, Not, Between }')

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
