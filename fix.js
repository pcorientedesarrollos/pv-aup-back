const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// revert the first replacement
ts = ts.replace(/async actualizarProducto\(id: number, data: { codigoBarras\?: string;\s+idCategoria\?: number \| null; imagenUrl\?: string }\)/, 'async actualizarProducto(id: number, data: { codigoBarras?: string; imagenUrl?: string })');

// find actualizarProductoCompleto signature
let target = `async actualizarProductoCompleto(id: number, data: {
    nombre?: string;
    codigoBarras?: string;`;
let replacement = `async actualizarProductoCompleto(id: number, data: {
    nombre?: string;
    codigoBarras?: string;
    idCategoria?: number | null;`;

ts = ts.replace(target, replacement);
fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
