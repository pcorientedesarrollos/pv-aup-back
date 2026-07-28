import json
import re

with open(r'C:\Users\EMMA\.gemini\antigravity\brain\682bcff8-198b-4ad9-8603-0d978be9bcad\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 1910:
                print(data['tool_calls'][0]['args']['CommandLine'])
        except Exception as e:
            pass
