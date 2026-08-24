const fs = require('fs');
const file = 'src/pos/pos.service.ts';
let ts = fs.readFileSync(file, 'utf8');

ts = ts.replace(
  /this\.productoRepo\.increment\(\{ idProducto: id \}, 'stock', data\.sumarStock\);/g,
  `this.productoRepo.increment({ idProducto: id }, 'stockActual', data.sumarStock);`
);

fs.writeFileSync(file, ts, 'utf8');
