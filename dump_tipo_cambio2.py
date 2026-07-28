import json
import re

with open(r'C:\Users\EMMA\.gemini\antigravity\brain\682bcff8-198b-4ad9-8603-0d978be9bcad\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'content' in data and 'async getTipoCambio' in data['content']:
                print(data['content'][:500])
                break
        except Exception as e:
            pass
