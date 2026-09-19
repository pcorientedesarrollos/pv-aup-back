const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

ts = ts.replace('const partes = [];', 'const partes: string[] = [];');
fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
console.log('Fixed typescript strict array typing.');
