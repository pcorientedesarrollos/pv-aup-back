import re

with open('src/pos/entities/pos-gasto.entity.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = "import { PosGastoCategoria } from './pos-gasto-categoria.entity';\n" + text

relation = '''
  @ManyToOne(() => PosGastoCategoria, { nullable: true })
  @JoinColumn({ name: 'id_categoria' })
  categoria: PosGastoCategoria;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
'''

text = text.replace('corte: PosCorteCaja;', 'corte: PosCorteCaja;' + relation)

with open('src/pos/entities/pos-gasto.entity.ts', 'w', encoding='utf-8') as f:
    f.write(text)
