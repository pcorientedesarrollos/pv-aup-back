const fs = require('fs');
const files = [
  'pos-categoria.entity.ts',
  'pos-cliente.entity.ts',
  'pos-configuracion.entity.ts',
  'pos-corte-caja.entity.ts',
  'pos-movimiento-inventario.entity.ts',
  'pos-producto.entity.ts',
  'pos-usuario.entity.ts',
  'pos-venta.entity.ts'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('Entity(')) return; // Sanity check
  
  if (!content.includes('import { Entity')) {
    // Collect all used decorators
    const decorators = ['Entity', 'Column', 'PrimaryGeneratedColumn', 'CreateDateColumn', 'ManyToOne', 'JoinColumn', 'OneToMany', 'UpdateDateColumn'];
    let used = decorators.filter(d => content.includes('@' + d));
    // ManyToOne and JoinColumn are definitely used
    used.push('ManyToOne', 'JoinColumn');
    used = [...new Set(used)];
    
    // Replace the bad line if it exists
    content = content.replace(/import \{ ManyToOne, JoinColumn \} from 'typeorm';/, '');
    
    content = \"import { \" + used.join(', ') + \" } from 'typeorm';\n\" + content;
    fs.writeFileSync(file, content);
  }
});
console.log('Imports fixed');
