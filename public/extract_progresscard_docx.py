from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

DOCX = Path('/home/ubuntu/upload/progresscard1page.docx')
OUT = Path('/home/ubuntu/jyoti-itc-portal/docs/progresscard-docx-extracted.txt')
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

with ZipFile(DOCX) as archive:
    root = ET.fromstring(archive.read('word/document.xml'))

lines = []
for table in root.findall('.//w:tbl', NS):
    rows = []
    for row in table.findall('./w:tr', NS):
        cells = []
        for cell in row.findall('./w:tc', NS):
            text = ''.join(node.text or '' for node in cell.findall('.//w:t', NS)).strip()
            cells.append(' '.join(text.split()))
        if any(cells):
            rows.append(' | '.join(cells))
    if rows:
        lines.extend(rows)
        lines.append('--- TABLE ---')

if not lines:
    for paragraph in root.findall('.//w:body/w:p', NS):
        text = ''.join(node.text or '' for node in paragraph.findall('.//w:t', NS)).strip()
        if text:
            lines.append(' '.join(text.split()))

OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'wrote {OUT} ({len(lines)} lines)')
