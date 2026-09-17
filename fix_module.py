# -*- coding: utf-8 -*-
with open('src/pos/pos.module.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'PosGasto,',
    'PosGasto,\n      PosGastoCategoria,'
)

with open('src/pos/pos.module.ts', 'w', encoding='utf-8') as f:
    f.write(text)
