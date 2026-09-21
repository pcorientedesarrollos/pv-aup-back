const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// Add import
if (!ts.includes('@nestjs/schedule')) {
    ts = ts.replace("import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';", "import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';\nimport { Cron, CronExpression } from '@nestjs/schedule';");
}

// Add the cron method before the closing brace of the class
let cronMethod = `
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'America/Mexico_City' })
  async cierreAutomaticoCajas() {
    console.log('Ejecutando cierre automático de cajas (Medianoche)...');
    try {
      const cortesAbiertos = await this.corteRepo.find({ where: { estatus: 'Abierto' } });
      for (const corte of cortesAbiertos) {
        const data = await this.getCorteDeCaja(corte.idCorte);
        const esperado = data.resumen.totalIngresos;
        await this.realizarCorte(corte.idCorte, esperado);
        console.log(\`Corte automático realizado para idCorte: \${corte.idCorte}\`);
      }
    } catch (e) {
      console.error('Error en cierre automático de cajas', e);
    }
  }
}
`;
ts = ts.replace(/\n\}\s*$/, cronMethod);
fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
console.log('Fixed pos.service.ts');
