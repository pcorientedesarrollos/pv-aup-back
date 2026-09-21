const fs = require('fs');
let ts = fs.readFileSync('src/dashboard/dashboard.module.ts', 'utf8');

ts = ts.replace("import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';", "import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';\nimport { PosProducto } from '../pos/entities/pos-producto.entity';");
ts = ts.replace("[PosCliente, PosVenta, PosVentaDetalle]", "[PosCliente, PosVenta, PosVentaDetalle, PosProducto]");

fs.writeFileSync('src/dashboard/dashboard.module.ts', ts, 'utf8');
console.log('Fixed dashboard.module.ts');
