const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

ts = ts.replace("import { Injectable,", "import { Cron, CronExpression } from '@nestjs/schedule';\nimport { Injectable,");

fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
console.log('Fixed pos.service.ts');
