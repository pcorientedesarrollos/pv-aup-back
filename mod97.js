const fs = require('fs');
let ts = fs.readFileSync('src/dashboard/dashboard.service.spec.ts', 'utf8');

ts = ts.replace("import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';", "import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';\nimport { PosProducto } from '../pos/entities/pos-producto.entity';");

let mockTarget = `          provide: getRepositoryToken(PosVentaDetalle),
          useValue: mockRepo,
        },`;
let mockReplacement = `          provide: getRepositoryToken(PosVentaDetalle),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(PosProducto),
          useValue: mockRepo,
        },`;

ts = ts.replace(mockTarget, mockReplacement);

fs.writeFileSync('src/dashboard/dashboard.service.spec.ts', ts, 'utf8');
console.log('Fixed dashboard.service.spec.ts');
