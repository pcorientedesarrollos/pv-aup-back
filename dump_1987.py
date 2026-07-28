import json
with open(r'C:\Users\EMMA\.gemini\antigravity\brain\682bcff8-198b-4ad9-8603-0d978be9bcad\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 1987:
                print(json.dumps(data, indent=2)[:2000])
        except:
            pass
