import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('let compras = [];', 'let compras: any[] = [];')
text = text.replace('corte.usuario?.sucursal?.idSucursal || corte.usuario?.idSucursal || 1', 'corte.usuario?.sucursal?.idSucursal || 1')

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
