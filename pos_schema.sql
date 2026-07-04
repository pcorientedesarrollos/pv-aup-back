-- ==========================================================
-- SCRIPT DE MIGRACIÓN: CREACIÓN DE TABLAS POS (PUNTO DE VENTA)
-- ==========================================================

-- 1. Tabla de Usuarios del POS
CREATE TABLE IF NOT EXISTS `pos_usuarios` (
  `id_usuario` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_completo` VARCHAR(255) NOT NULL,
  `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE,
  `contrasena_hash` VARCHAR(255) NOT NULL,
  `rol` VARCHAR(50) DEFAULT 'Cajero', -- 'Administrador', 'Cajero'
  `activo` BOOLEAN DEFAULT TRUE,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías del POS
CREATE TABLE IF NOT EXISTS `pos_categorias` (
  `id_categoria` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `color` VARCHAR(50) DEFAULT 'bg-slate-600',
  `activo` BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de Productos del POS
CREATE TABLE IF NOT EXISTS `pos_productos` (
  `id_producto` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_barras` VARCHAR(100) UNIQUE,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `precio_unitario` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `iva` DECIMAL(5,2) DEFAULT 0.00, -- Ej. 16.00, 8.00, 0.00
  `precio_publico` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `precio_mayoreo` DECIMAL(10,2),
  `imagen_url` VARCHAR(255),
  `stock_actual` DECIMAL(10,2) DEFAULT 0.00,
  `stock_minimo` DECIMAL(10,2) DEFAULT 0.00,
  `id_categoria` INT,
  `activo` BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (`id_categoria`) REFERENCES `pos_categorias`(`id_categoria`) ON DELETE SET NULL
);

-- 4. Tabla de Clientes del POS
CREATE TABLE IF NOT EXISTS `pos_clientes` (
  `id_cliente` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_completo` VARCHAR(255) NOT NULL,
  `rfc` VARCHAR(20),
  `correo` VARCHAR(100),
  `telefono` VARCHAR(50),
  `direccion` TEXT,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Cortes de Caja (Turnos)
CREATE TABLE IF NOT EXISTS `pos_cortes_caja` (
  `id_corte` INT AUTO_INCREMENT PRIMARY KEY,
  `id_usuario` INT NOT NULL,
  `fecha_apertura` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` TIMESTAMP NULL,
  `fondo_inicial` DECIMAL(10,2) DEFAULT 0.00,
  `efectivo_declarado` DECIMAL(10,2) DEFAULT 0.00,
  `estatus` VARCHAR(20) DEFAULT 'Abierto', -- 'Abierto', 'Cerrado'
  FOREIGN KEY (`id_usuario`) REFERENCES `pos_usuarios`(`id_usuario`)
);

-- 6. Tabla de Ventas (Tickets)
CREATE TABLE IF NOT EXISTS `pos_ventas` (
  `id_venta` INT AUTO_INCREMENT PRIMARY KEY,
  `folio` VARCHAR(50) NOT NULL UNIQUE,
  `fecha_venta` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` INT NOT NULL,
  `id_cliente` INT,
  `id_corte` INT NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `descuento` DECIMAL(10,2) DEFAULT 0.00,
  `total_iva` DECIMAL(10,2) DEFAULT 0.00,
  `total_pagado` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `metodo_pago` VARCHAR(50) DEFAULT 'Efectivo', -- 'Efectivo', 'Tarjeta', 'Transferencia'
  `estatus` VARCHAR(20) DEFAULT 'Completada', -- 'Completada', 'Cancelada'
  FOREIGN KEY (`id_usuario`) REFERENCES `pos_usuarios`(`id_usuario`),
  FOREIGN KEY (`id_cliente`) REFERENCES `pos_clientes`(`id_cliente`) ON DELETE SET NULL,
  FOREIGN KEY (`id_corte`) REFERENCES `pos_cortes_caja`(`id_corte`)
);

-- 7. Tabla de Detalles de Venta
CREATE TABLE IF NOT EXISTS `pos_ventas_detalle` (
  `id_detalle` INT AUTO_INCREMENT PRIMARY KEY,
  `id_venta` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL, -- Precio sin IVA al momento de la venta
  `monto_iva` DECIMAL(10,2) DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) NOT NULL, -- Incluye IVA (o se puede calcular)
  FOREIGN KEY (`id_venta`) REFERENCES `pos_ventas`(`id_venta`) ON DELETE CASCADE,
  FOREIGN KEY (`id_producto`) REFERENCES `pos_productos`(`id_producto`)
);

-- 8. Tabla de Movimientos de Inventario (Kardex)
CREATE TABLE IF NOT EXISTS `pos_movimientos_inventario` (
  `id_movimiento` INT AUTO_INCREMENT PRIMARY KEY,
  `id_producto` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `tipo_movimiento` VARCHAR(50) NOT NULL, -- 'Entrada', 'Salida', 'Ajuste', 'Venta', 'Cancelación'
  `cantidad` DECIMAL(10,2) NOT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `referencia` VARCHAR(255),
  FOREIGN KEY (`id_producto`) REFERENCES `pos_productos`(`id_producto`),
  FOREIGN KEY (`id_usuario`) REFERENCES `pos_usuarios`(`id_usuario`)
);

-- 9. Tabla de Configuración General
CREATE TABLE IF NOT EXISTS `pos_configuracion` (
  `id_config` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_empresa` VARCHAR(255) DEFAULT 'AUP POS',
  `rfc_empresa` VARCHAR(20),
  `mensaje_ticket` TEXT,
  `impresora_activa` VARCHAR(100)
);

-- Insertar configuración por defecto
INSERT INTO `pos_configuracion` (`nombre_empresa`, `mensaje_ticket`) 
SELECT 'AUP POS', '¡Gracias por su compra!'
WHERE NOT EXISTS (SELECT 1 FROM `pos_configuracion`);
