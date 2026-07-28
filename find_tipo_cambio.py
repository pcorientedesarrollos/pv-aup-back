import json
import re

with open(r'C:\Users\EMMA\.gemini\antigravity\brain\682bcff8-198b-4ad9-8603-0d978be9bcad\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'content' in data and 'getTipoCambio' in data['content']:
                content = data['content']
                # extract method
                match = re.search(r'async getTipoCambio\(\)[\s\S]*?\}', content)
                if match:
                    print('FOUND in step', data.get('step_index'))
                    print(match.group(0))
                    break
        except Exception as e:
            pass
