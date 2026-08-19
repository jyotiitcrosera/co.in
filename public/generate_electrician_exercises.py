from pathlib import Path
import re

source = Path('/home/ubuntu/jyoti-itc-portal/docs/progresscard-docx-extracted.txt')
out = Path('/home/ubuntu/jyoti-itc-portal/shared/electricianExercises.ts')
rows = []
seen = set()
for line in source.read_text(encoding='utf-8').splitlines():
    match = re.match(r'^(\d+) \| (.+?) \|', line)
    if not match:
        continue
    number, text = int(match.group(1)), match.group(2).strip()
    if number < 1 or number > 104:
        continue
    if number in seen:
        continue
    seen.add(number)
    text = text.replace('IDENTYFY', 'IDENTIFY').replace('SIMBALLS', 'SYMBOLS').replace('HAZZERD', 'HAZARD')
    text = text.replace('PREVEVANTIVE MAJORS', 'PREVENTIVE MEASURES').replace('ELEMENTRY', 'ELEMENTARY')
    text = text.replace('PERSIONAL', 'PERSONAL').replace('CLEANESS', 'CLEANLINESS').replace('NTRADE', 'TRADE')
    text = text.replace('NAD', 'AND').replace('LIFFTING', 'LIFTING').replace('EUIPMENTS', 'EQUIPMENT')
    text = text.replace('PRECATION', 'PRECAUTION').replace('HACSAWING', 'HACKSAWING').replace('SKINING', 'SKINNING')
    text = text.replace('CRIPING', 'CRIMPING').replace('REGISTANCE', 'RESISTANCE').replace('UNDER FROUND', 'UNDERGROUND')
    text = text.replace('FOLT', 'FAULT').replace('VOLAGE', 'VOLTAGE').replace('KIRCHHOFFS LOW', "KIRCHHOFF'S LAW")
    text = text.replace('WHEATSTONE', 'WHEATSTONE').replace('CHARECTERISTICS', 'CHARACTERISTICS').replace('TEMPRATURE', 'TEMPERATURE')
    text = text.replace('MAGNAET', 'MAGNET').replace('MUTUALLY INDUCED', 'MUTUALLY INDUCED').replace('PF', 'POWER FACTOR')
    text = text.replace('RANSFORMERS', 'TRANSFORMERS').replace('ETERMINE', 'DETERMINE').replace('THREE PHASE  OPERATION', 'THREE-PHASE OPERATION')
    rows.append((number, text))
rows.sort()
content = 'export type ElectricianExercise = { week: number; text: string };\n\nexport const ELECTRICIAN_EXERCISES: ElectricianExercise[] = [\n' + ''.join(f'  {{ week: {n}, text: {text!r} }},\n' for n, text in rows) + '];\n'
out.write_text(content, encoding='utf-8')
print(f'wrote {out} with {len(rows)} exercises')
