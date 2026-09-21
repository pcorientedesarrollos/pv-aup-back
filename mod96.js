const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

ts = ts.trim();
if (ts.endsWith('}')) {
  if (ts.endsWith('  }')) {
    ts = ts.substring(0, ts.length - 3) + '\n}';
  }
}
fs.writeFileSync('src/pos/pos.service.ts', ts + '\n', 'utf8');
console.log('Fixed pos.service.ts');
