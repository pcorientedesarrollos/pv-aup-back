const fs = require('fs');
let ts = fs.readFileSync('src/app.module.ts', 'utf8');
ts = ts.replace("import { Module } from '@nestjs/common';", "import { Module } from '@nestjs/common';\nimport { ScheduleModule } from '@nestjs/schedule';");
ts = ts.replace("imports: [", "imports: [\n    ScheduleModule.forRoot(),");
fs.writeFileSync('src/app.module.ts', ts, 'utf8');
console.log('Fixed app.module.ts');
