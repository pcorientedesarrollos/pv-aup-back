const fs = require('fs');
const file = 'src/pos/pos.service.ts';
let content = fs.readFileSync(file, 'utf8');

const queryVentas = 
    const ventasList = await this.ventaRepo.find({
      where: { corte: { idCorte } },
      relations: { cliente: true },
      order: { fechaVenta: 'DESC' }
    });
;

content = content.replace(
  "const gastos = await this.gastoRepo.find({",
  queryVentas + "\n    const gastos = await this.gastoRepo.find({"
);

content = content.replace(
  "return {",
  "return {\n      ventasList,"
);

fs.writeFileSync(file, content, 'utf8');
