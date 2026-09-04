const fs = require('fs');

const file = 'src/pos/pos.service.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/producto\.precioCompra = calcularCostoPromedioPonderado\([\s\S]*?payload\.costoUnitario[\s\n]*\);/,
  \producto.precioCompra = calcularCostoPromedioPonderado(
          stockPrevio, 
          costoPrevio, 
          cantidadNumber, 
          Number(payload.costoUnitario)
        );\);

c = c.replace(/pCompra\.precioCompra = calcularCostoPromedioPonderado\([\s\S]*?item\.precioCosto[\s\n]*\);/,
  \pCompra.precioCompra = calcularCostoPromedioPonderado(
                stockPrevio,
                costoPrevio,
                cantidadEntrante,
                Number(item.precioCosto)
              );\);

fs.writeFileSync(file, c);
console.log('Numbers patched');
