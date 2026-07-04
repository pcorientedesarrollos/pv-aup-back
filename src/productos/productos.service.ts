import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async create(producto: Producto): Promise<Producto> {
    return this.productosRepository.save(producto);
  }

  findAll(): Promise<Producto[]> {
    return this.productosRepository.find();
  }

  findByCategoria(categoria: string): Promise<Producto[]> {
    return this.productosRepository.find({ where: { categoria } });
  }

  async updateStock(idProducto: number, cantidad: number): Promise<void> {
    const producto = await this.productosRepository.findOne({ where: { idProducto } });
    if (producto) {
      // Ensure it's treated as a number
      producto.stockActual = Number(producto.stockActual) + Number(cantidad);
      await this.productosRepository.save(producto);
    }
  }
}
