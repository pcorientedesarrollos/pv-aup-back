const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// replace the last '}\n}' with '}'
let idx = ts.lastIndexOf('  }\n}');
if (idx !== -1) {
  ts = ts.substring(0, idx) + '  }\n';
}

fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
console.log('Fixed pos.service.ts');
