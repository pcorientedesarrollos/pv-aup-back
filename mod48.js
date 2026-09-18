const fs = require('fs');
let text = fs.readFileSync('src/pos/pos.service.ts', 'utf-8');

const regex = /const sumasGastos = await this\.gastoRepo\.createQueryBuilder[\s\S]*?const totalCancelado = Number\(sumasVentas\?\.totalcancelado \|\| sumasVentas\?\.totalCancelado \|\| 0\);/m;

const replacement = `const sumasGastos = await this.gastoRepo.createQueryBuilder('gasto')
      .select("SUM(gasto.monto)", "totalGastos")
      .where("gasto.id_sucursal = :idSucursal", { idSucursal: corte.usuario?.sucursal?.idSucursal || corte.sucursal?.idSucursal || 1 })
      .andWhere("gasto.fecha >= :apertura", { apertura: corte.fechaApertura })
      .andWhere("gasto.fecha <= :cierre", { cierre: corte.fechaCierre || new Date() })
      .getRawOne();

    const gastos = await this.gastoRepo.createQueryBuilder('gasto')
      .leftJoinAndSelect('gasto.categoria', 'categoria')
      .where("gasto.id_sucursal = :idSucursal", { idSucursal: corte.usuario?.sucursal?.idSucursal || corte.sucursal?.idSucursal || 1 })
      .andWhere("gasto.fecha >= :apertura", { apertura: corte.fechaApertura })
      .andWhere("gasto.fecha <= :cierre", { cierre: corte.fechaCierre || new Date() })
      .orderBy('gasto.fecha', 'DESC')
      .limit(200)
      .getMany();

    const ventasList = await this.ventaRepo.find({
      where: { corte: { idCorte } },
      relations: { cliente: true },
      order: { fechaVenta: 'DESC' }
    });

    const totalEfectivo = Number(sumasVentas?.totalefectivo || sumasVentas?.totalEfectivo || 0);
    const totalTarjeta = Number(sumasVentas?.totaltarjeta || sumasVentas?.totalTarjeta || 0);
    const totalTransferencia = Number(sumasVentas?.totaltransferencia || sumasVentas?.totalTransferencia || 0);
    const totalCancelado = Number(sumasVentas?.totalcancelado || sumasVentas?.totalCancelado || 0);`;

text = text.replace(regex, replacement);

const regexCompras = /let compras: any\[\] = \[\];\s*if \(corte\.fechaApertura\) {[\s\S]*?take: 100\s*}\);\s*}/m;
const replacementCompras = `let compras: any[] = [];
    if (corte.fechaApertura) {
      const fechaCierre = corte.fechaCierre || new Date();
      compras = await this.compraRepo.createQueryBuilder('compra')
        .leftJoinAndSelect('compra.proveedor', 'proveedor')
        .where('compra.id_sucursal = :idSucursal', { idSucursal: corte.usuario?.sucursal?.idSucursal || corte.sucursal?.idSucursal || 1 })
        .andWhere('compra.fecha_compra >= :apertura', { apertura: corte.fechaApertura })
        .andWhere('compra.fecha_compra <= :cierre', { cierre: fechaCierre })
        .orderBy('compra.fecha_compra', 'DESC')
        .limit(100)
        .getMany();
    }`;

text = text.replace(regexCompras, replacementCompras);

// And we must fix registrarGasto to link to the newest Abierto turno, just in case!
const regexRegistrar = /const turno = await this\.corteRepo\.findOne\({\s*where: { usuario: { sucursal: { idSucursal } }, estatus: 'Abierto' }\s*}\);/m;
const replacementRegistrar = `const turno = await this.corteRepo.findOne({
      where: { usuario: { sucursal: { idSucursal } }, estatus: 'Abierto' },
      order: { fechaApertura: 'DESC' }
    });`;
    
text = text.replace(regexRegistrar, replacementRegistrar);

fs.writeFileSync('src/pos/pos.service.ts', text, 'utf-8');
console.log('Done!');
