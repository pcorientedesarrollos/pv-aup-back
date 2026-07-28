import os
with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { PosFactura } from './entities/pos-factura.entity';",
    "import { PosFactura } from './entities/pos-factura.entity';\nimport { PosCotizacion } from './entities/pos-cotizacion.entity';\nimport { PosCotizacionDetalle } from './entities/pos-cotizacion-detalle.entity';"
)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("IMPORTS ADDED")
