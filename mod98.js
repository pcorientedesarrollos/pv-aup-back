const fs = require('fs');
let ts = fs.readFileSync('src/dashboard/dashboard.service.spec.ts', 'utf8');

ts = ts.replace(
  "{ provide: getRepositoryToken(PosVentaDetalle), useValue: makeRepoMock() },",
  "{ provide: getRepositoryToken(PosVentaDetalle), useValue: makeRepoMock() },\n        { provide: getRepositoryToken(PosProducto), useValue: makeRepoMock() },"
);

fs.writeFileSync('src/dashboard/dashboard.service.spec.ts', ts, 'utf8');
console.log('Fixed test');
