# -*- coding: utf-8 -*-
with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = '@InjectRepository(PosGasto) private gastoRepo: Repository<PosGasto>,'
replacement = '@InjectRepository(PosGasto) private gastoRepo: Repository<PosGasto>,\n    @InjectRepository(PosGastoCategoria) private gastoCategoriaRepo: Repository<PosGastoCategoria>,'

text = text.replace(target, replacement)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
