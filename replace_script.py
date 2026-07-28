import sys
import os

with open('to_replace.txt', 'r', encoding='utf-8') as f:
    target = f.read()

with open('new_func.txt', 'r', encoding='utf-8') as f:
    new_func = f.read()

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if target in content:
    content = content.replace(target, new_func)
    
    # Fix regimenFiscal issue while we are at it
    old_reg = "else if (text.match(/Sin obligaciones/i)) regimenFiscal = '616';"
    new_reg = "else if (text.match(/Sin obligaciones/i)) regimenFiscal = '616';\n\n      if (!regimenFiscal && rfc) {\n        regimenFiscal = rfc.length === 13 ? '612' : '601';\n      }"
    content = content.replace(old_reg, new_reg)
    
    with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS')
else:
    print('FAIL: target not found')
