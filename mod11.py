import re

with open('src/pos/pos.module.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "import { PosGasto } from './entities/pos-gasto.entity';",
    "import { PosGasto } from './entities/pos-gasto.entity';\nimport { PosGastoCategoria } from './entities/pos-gasto-categoria.entity';"
)

text = text.replace(
    "PosDevolucion, PosSucursal, PosInventarioMovimiento, PosGasto",
    "PosDevolucion, PosSucursal, PosInventarioMovimiento, PosGasto, PosGastoCategoria"
)

with open('src/pos/pos.module.ts', 'w', encoding='utf-8') as f:
    f.write(text)
