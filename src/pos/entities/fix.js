const fs = require('fs');
const path = require('path');

const files = [
  'pos-categoria.entity.ts',
  'pos-cliente.entity.ts',
  'pos-configuracion.entity.ts',
  'pos-corte-caja.entity.ts',
  'pos-movimiento-inventario.entity.ts',
  'pos-producto.entity.ts',
  'pos-usuario.entity.ts',
  'pos-venta.entity.ts',
  'pos-venta-detalle.entity.ts'
];

files.forEach(f => {
  const file = path.join(__dirname, f);
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { Entity')) {
    const decorators = ['Entity', 'Column', 'PrimaryGeneratedColumn', 'CreateDateColumn', 'ManyToOne', 'JoinColumn', 'OneToMany', 'UpdateDateColumn'];
    let used = decorators.filter(d => content.includes('@' + d));
    used.push('ManyToOne', 'JoinColumn');
    used = [...new Set(used)];
    
    content = content.replace(/import \{ ManyToOne, JoinColumn \} from 'typeorm';\n?/, '');
    content = `import { ${used.join(', ')} } from 'typeorm';\n` + content;
    
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed');
