import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn({ name: 'idProducto' })
  idProducto: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  codigoBarras: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioCompra: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioVenta: number;

  @Column({ type: 'varchar', length: 50 })
  categoria: string; // Ej: 'Cera', 'Apícola', 'Derivados', 'Envases'

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagenUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stockActual: number;
}
