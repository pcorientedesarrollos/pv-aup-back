import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', {
    storage: diskStorage({
      destination: './uploads/productos',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const productoData = new Producto();
    productoData.codigoBarras = body.codigoBarras || null;
    productoData.nombre = body.nombre;
    productoData.precioCompra = parseFloat(body.precioCompra) || 0;
    productoData.precioVenta = parseFloat(body.precioVenta) || 0;
    productoData.categoria = body.categoria;
    productoData.stockActual = parseFloat(body.stockActual) || 0;
    
    if (file) {
      productoData.imagenUrl = `/uploads/productos/${file.filename}`;
    }
    
    return this.productosService.create(productoData);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: string) {
    return this.productosService.findByCategoria(categoria);
  }
}
