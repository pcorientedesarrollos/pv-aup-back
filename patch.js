const fs = require('fs');
let content = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// 1. Add groupBy for 'p.idProducto' and 'categoria.idCategoria' in listarProductos
const joinCode = "query.leftJoin('p.sucursales', 'sp');";
if (content.includes(joinCode) && !content.includes("query.addGroupBy('p.idProducto');")) {
    const replacement = joinCode + "\n\n      // Agrupación estricta MySQL\n      query.addGroupBy('p.idProducto');\n      query.addGroupBy('categoria.idCategoria');";
    content = content.replace(joinCode, replacement);
}

// 2. Add the Receta/Produccion methods before the last closing brace
const methods = \
  // --- Gestión de Recetas ---
  async agregarReceta(idProductoPadre: number, idProductoHijo: number, cantidad: number) {
    const receta = this.recetaRepo.create({
      productoPadre: { idProducto: idProductoPadre },
      productoHijo: { idProducto: idProductoHijo },
      cantidad
    });
    return this.recetaRepo.save(receta);
  }

  async obtenerRecetas(idProductoPadre: number) {
    return this.recetaRepo.find({
      where: { productoPadre: { idProducto: idProductoPadre } },
      relations: { productoHijo: true }
    });
  }

  async eliminarReceta(idReceta: number) {
    return this.recetaRepo.delete(idReceta);
  }

  // --- Producción y Fraccionamiento ---
  async fraccionarProducto(idSucursal: number, idProductoPadre: number, cantidad: number, productosResultantes: any[], idUsuario: number) {
    const parseNumber = (val: any) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'string') val = val.replace(/,/g, '');
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productoPadre = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: idProductoPadre } });
      if (!productoPadre) throw new BadRequestException('Producto padre no encontrado');

      const usuario = await queryRunner.manager.findOne(PosUsuario, { where: { idUsuario }, relations: { sucursal: true } });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');

      const cantidadNum = parseNumber(cantidad);
      if (parseNumber(productoPadre.stockActual) < cantidadNum) {
        throw new BadRequestException(\\\Stock insuficiente de \\\ para fraccionar\\\);
      }

      // Salida del padre
      productoPadre.stockActual = parseNumber(productoPadre.stockActual) - cantidadNum;
      await queryRunner.manager.save(productoPadre);

      const movSalida = queryRunner.manager.create(PosMovimientoInventario, {
        producto: productoPadre,
        usuario,
        sucursal: { idSucursal },
        tipoMovimiento: 'Fraccionamiento_OUT',
        cantidad: cantidadNum,
        referencia: 'Fraccionamiento de producto'
      });
      await queryRunner.manager.save(movSalida);

      // Entradas de los hijos
      for (const item of productosResultantes) {
        if (!item.idProducto) continue;
        const productoHijo = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.idProducto } });
        if (!productoHijo) throw new BadRequestException(\\\Producto resultante \\\ no encontrado\\\);

        const itemCantidad = parseNumber(item.cantidad);
        productoHijo.stockActual = parseNumber(productoHijo.stockActual) + itemCantidad;
        await queryRunner.manager.save(productoHijo);

        const movEntrada = queryRunner.manager.create(PosMovimientoInventario, {
          producto: productoHijo,
          usuario,
          sucursal: { idSucursal },
          tipoMovimiento: 'Fraccionamiento_IN',
          cantidad: itemCantidad,
          referencia: \\\Derivado de fraccionamiento de \\\\\\
        });
        await queryRunner.manager.save(movEntrada);
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Fraccionamiento completado' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async producirArticulo(idSucursal: number, idProducto: number, cantidad: number, idUsuario: number) {
    const parseNumber = (val: any) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'string') val = val.replace(/,/g, '');
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productoTerminado = await queryRunner.manager.findOne(PosProducto, { where: { idProducto } });
      if (!productoTerminado) throw new BadRequestException('Producto a producir no encontrado');

      const usuario = await queryRunner.manager.findOne(PosUsuario, { where: { idUsuario }, relations: { sucursal: true } });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');

      const receta = await queryRunner.manager.find(PosReceta, { 
        where: { productoPadre: { idProducto } },
        relations: { productoHijo: true }
      });

      if (!receta || receta.length === 0) {
        throw new BadRequestException('El producto no tiene una receta configurada para producción');
      }

      const cantidadNum = parseNumber(cantidad);

      // 1. Descontar ingredientes (hijos)
      for (const item of receta) {
        const cantRequerida = parseNumber(item.cantidad) * cantidadNum;
        const ingrediente = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.productoHijo.idProducto } });
        
        if (parseNumber(ingrediente.stockActual) < cantRequerida) {
           throw new BadRequestException(\\\Stock insuficiente de ingrediente: \\\\\\);
        }

        ingrediente.stockActual = parseNumber(ingrediente.stockActual) - cantRequerida;
        await queryRunner.manager.save(ingrediente);

        const movSalida = queryRunner.manager.create(PosMovimientoInventario, {
          producto: ingrediente,
          usuario,
          sucursal: { idSucursal },
          tipoMovimiento: 'Produccion_OUT',
          cantidad: cantRequerida,
          referencia: \\\Consumo para producción de \\\\\\
        });
        await queryRunner.manager.save(movSalida);
      }

      // 2. Sumar producto terminado (padre)
      productoTerminado.stockActual = parseNumber(productoTerminado.stockActual) + cantidadNum;
      await queryRunner.manager.save(productoTerminado);

      const movEntrada = queryRunner.manager.create(PosMovimientoInventario, {
        producto: productoTerminado,
        usuario,
        sucursal: { idSucursal },
        tipoMovimiento: 'Produccion_IN',
        cantidad: cantidadNum,
        referencia: 'Producción de artículo'
      });
      await queryRunner.manager.save(movEntrada);

      await queryRunner.commitTransaction();
      return { success: true, message: 'Producción completada' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
\;

if (!content.includes('fraccionarProducto')) {
    content = content.replace(/\s*}\s*$/, '\n' + methods + '\n}\n');
}

fs.writeFileSync('src/pos/pos.service.ts', content, 'utf8');
