const fs = require('fs');
let content = fs.readFileSync('src/pos/pos.controller.ts', 'utf8');

const endpoints = [
  'getProductos', 'getCategorias', 'getClientes', 'getUsuarios', 
  'getAllCortes', 'getVentas', 'getMovimientosInventario', 'getDashboardStats'
];

endpoints.forEach(ep => {
  content = content.replace(new RegExp(ep + '\\(\\) {'), ep + '(@Headers(\"x-sucursal-id\") idSucursal: string) {');
  content = content.replace(new RegExp('this.posService.' + ep + '\\(\\)'), 'this.posService.' + ep + '(Number(idSucursal))');
});

fs.writeFileSync('src/pos/pos.controller.ts', content);
console.log('Patched');
