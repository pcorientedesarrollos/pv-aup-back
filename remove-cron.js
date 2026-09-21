const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// Use regex to remove the cron job method
ts = ts.replace(/@Cron\(CronExpression\.EVERY_DAY_AT_MIDNIGHT[\s\S]*?console\.error\('Error en cierre automático de cajas', e\);\n\s*\}\n\s*\}/, '}');

// Try removing the import if it exists
ts = ts.replace("import { Cron, CronExpression } from '@nestjs/schedule';\n", "");

fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
console.log('Cron removed');
