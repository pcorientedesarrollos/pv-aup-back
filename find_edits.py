import json
with open(r'C:\Users\EMMA\.gemini\antigravity\brain\682bcff8-198b-4ad9-8603-0d978be9bcad\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] in ['multi_replace_file_content', 'replace_file_content', 'write_to_file', 'run_command']:
                        args = call['args']
                        if 'TargetFile' in args and 'pos.service.ts' in args['TargetFile']:
                            print(f'Found edit in step {data.get("step_index")}')
                        elif 'CommandLine' in args and 'pos.service.ts' in args['CommandLine'] and 'python' in args['CommandLine']:
                            print(f'Found python script in step {data.get("step_index")}')
        except:
            pass
