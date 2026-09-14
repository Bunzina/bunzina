"""Generate the domain ER SVG/PNG from migrations 001–012 (Python + librsvg/Cairo).
Run from any directory: python3 docs/arch/diagrams/generate_er.py
Layout is explicit; schema changes require reviewing the layout and relationships.
"""
from pathlib import Path
import ctypes as C
import ctypes.util
import html
import re

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs' / 'arch'
tables = {}
for migration in sorted((ROOT / 'migrations').glob('*.sql')):
    sql = migration.read_text()
    for match in re.finditer(r'CREATE TABLE IF NOT EXISTS bunzina\.(\w+)\s*\((.*?)\);', sql, re.S):
        tables[match[1]] = [line.strip().rstrip(',') for line in match[2].splitlines() if line.strip()]
    for match in re.finditer(r'ALTER TABLE (?:IF EXISTS )?bunzina\.(\w+)\s+(.*?);', sql, re.S):
        tables[match[1]].extend(re.findall(r'ADD COLUMN IF NOT EXISTS ([^\n]+)', match[2]))

schema = {}
edges = {}
for table, definitions in tables.items():
    columns = []
    for definition in definitions:
        match = re.match(r'(\w+)\s+((?:bunzina\.)?\w+(?:\([^)]*\))?)(.*)', definition)
        if not match:
            raise ValueError(definition)
        name, dtype, rest = match.groups()
        pk = 'PRIMARY KEY' in rest
        nullable = not pk and 'NOT NULL' not in rest
        fk = re.search(r'REFERENCES bunzina\.(\w+)\((\w+)\)', rest)
        flags = [flag for flag, active in [('PK', pk), ('FK', fk), ('UK', 'UNIQUE' in rest)] if active]
        columns.append((name, dtype.replace('bunzina.', '').replace(', ', ','), ' '.join(flags), nullable))
        if fk:
            delete = re.search(r'ON DELETE (CASCADE|SET NULL)', rest)
            edges[(fk[1], table)] = (name, '0..1' if nullable else '1', delete[1] if delete else 'NO ACTION')
    schema[table] = columns

# Three columns; all links travel through the gutters, never over table fields.
positions = {
    'customers': (120, 230, '#2563eb'),
    'vehicles': (920, 230, '#2563eb'),
    'users': (1720, 230, '#64748b'),
    'service_orders': (120, 850, '#6d28d9'),
    'service_order_service_items': (920, 850, '#0e7490'),
    'services': (1720, 850, '#0e7490'),
    'stock_movements': (120, 1470, '#b45309'),
    'auto_parts': (920, 1470, '#b45309'),
    'service_order_auto_part_items': (1720, 1470, '#b45309'),
}
assert set(schema) == set(positions), 'Review layout for added/removed tables'
assert len(edges) == 9, 'Review layout for changed foreign keys'
W, H, CARD, ROW = 2480, 2200, 640, 29
heights = {name: 83 + ROW * len(cols) for name, cols in schema.items()}
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
'<rect width="100%" height="100%" fill="#f6f8fc"/>',
'<style>text{font-family:DejaVu Sans,sans-serif;fill:#18243b}.muted{fill:#58677f}.field{font-family:DejaVu Sans Mono,monospace;font-size:18px}.dtype{font-family:DejaVu Sans Mono,monospace;font-size:16px;fill:#607088}</style>']
def text(x, y, value, size=20, cls='', fill=None, weight=None, anchor=None):
    attrs = f' class="{cls}" font-size="{size}"'
    if fill: attrs += f' style="fill:{fill}"'
    if weight: attrs += f' font-weight="{weight}"'
    if anchor: attrs += f' text-anchor="{anchor}"'
    svg.append(f'<text x="{x}" y="{y}"{attrs}>{html.escape(str(value))}</text>')

def badge(x, y, label, color):
    width = 66 if len(label) > 1 else 36
    svg.append(f'<rect x="{x-width/2}" y="{y-15}" width="{width}" height="30" rx="10" fill="#f6f8fc" stroke="{color}"/>')
    text(x, y+7, label, 20, fill=color, weight=700, anchor='middle')

def link(parent, child, points, parent_label, child_label):
    field, cardinality, delete = edges[(parent, child)]
    color = '#b45309' if cardinality == '0..1' else '#71809a'
    dash = ' stroke-dasharray="9 7"' if cardinality == '0..1' else ''
    path = 'M' + ' L'.join(f'{x},{y}' for x,y in points)
    svg.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="3" stroke-linejoin="round"{dash}/>')
    badge(*parent_label, cardinality, color)
    badge(*child_label, '0..*', color)

text(120, 82, 'BUNZINA / MODELO ENTIDADE–RELACIONAMENTO', 36, weight=700)
text(120, 127, 'Schema bunzina · 9 tabelas · 9 chaves estrangeiras · migrations 001–012', 23, cls='muted')
text(120, 168, 'Cardinalidade em cada ponta: 1 = exatamente um    0..1 = opcional    0..* = zero ou muitos', 21, cls='muted')

link('customers', 'vehicles', [(760,360),(920,360)], (792,360),(875,360))
link('customers', 'service_orders', [(360,heights['customers']+230),(360,850)], (360,780),(360,820))
link('vehicles', 'service_orders', [(1120,230+heights['vehicles']),(1120,775),(690,775),(690,850)], (1120,595),(690,820))
link('service_orders', 'service_order_service_items', [(760,985),(920,985)], (792,985),(875,985))
link('services', 'service_order_service_items', [(1720,985),(1560,985)], (1688,985),(1605,985))
link('service_orders', 'stock_movements', [(360,850+heights['service_orders']),(360,1470)], (360,1350),(360,1437))
link('auto_parts', 'stock_movements', [(920,1600),(760,1600)], (888,1600),(805,1600))
link('auto_parts', 'service_order_auto_part_items', [(1560,1600),(1720,1600)], (1592,1600),(1675,1600))
link('service_orders', 'service_order_auto_part_items', [(120,1135),(60,1135),(60,1865),(2040,1865),(2040,1470+heights['service_order_auto_part_items'])], (60,1180),(2040,1805))
text(1110, 1848, 'service_orders → service_order_auto_part_items', 18, cls='muted', anchor='middle')

for name, (x,y,color) in positions.items():
    h = heights[name]
    svg.append(f'<rect x="{x}" y="{y+5}" width="{CARD}" height="{h}" rx="12" fill="#e5eaf2"/>')
    svg.append(f'<rect x="{x}" y="{y}" width="{CARD}" height="{h}" rx="12" fill="white" stroke="#d2dbe7"/>')
    svg.append(f'<path d="M{x+12},{y} H{x+CARD-12} Q{x+CARD},{y} {x+CARD},{y+12} V{y+52} H{x} V{y+12} Q{x},{y} {x+12},{y}" fill="{color}"/>')
    text(x+18,y+34,name,23,fill='white',weight=700)
    text(x+18,y+75,'CHAVE',12,cls='muted',weight=700)
    text(x+92,y+75,'COLUNA',12,cls='muted',weight=700)
    text(x+390,y+75,'TIPO',12,cls='muted',weight=700)
    text(x+622,y+75,'NULO',12,cls='muted',weight=700,anchor='end')
    for i,(col,dtype,flags,nullable) in enumerate(schema[name]):
        baseline = y+104+i*ROW
        if 'FK' in flags:
            svg.append(f'<rect x="{x+1}" y="{baseline-22}" width="{CARD-2}" height="{ROW}" fill="#eff5ff"/>')
        elif i%2 == 0:
            svg.append(f'<rect x="{x+1}" y="{baseline-22}" width="{CARD-2}" height="{ROW}" fill="#f8fafc"/>')
        text(x+18,baseline,flags,15,fill=color,weight=700)
        text(x+92,baseline,col,cls='field')
        text(x+390,baseline,dtype,cls='dtype')
        if nullable: text(x+622,baseline,'sim',15,fill='#b45309',anchor='end')

text(1720, 590, 'users não possui FK para outras tabelas.', 21, cls='muted')
text(1720, 623, 'Nenhuma relação com customers é definida nas migrations.', 18, cls='muted')

svg.append('<rect x="120" y="1930" width="2240" height="210" rx="14" fill="#eaf0f8"/>')
text(150,1970,'COMO LER O MODELO',20,weight=700)
text(150,2010,'PK: chave primária   ·   FK: chave estrangeira   ·   UK: UNIQUE   ·   NULO vazio: NOT NULL',20)
text(150,2045,'Cada filho aponta para 1 pai; um pai pode ter 0..* filhos. Exceção: stock_movements.service_order_id aceita NULL (0..1 OS).',20)
text(150,2080,'Linha tracejada: vínculo opcional com a OS. users é independente. Relações N:N de OS com serviços/peças passam pelas tabelas de itens.',20)
text(150,2115,'Todas as colunas das migrations 001–012 estão representadas. Defaults, CHECKs e ações ON DELETE: consultar as migrations e o Markdown.',18,cls='muted')
svg.append('</svg>')
svg_path = OUT / 'er.svg'
svg_path.write_text('\n'.join(svg)+'\n')

# Render using the OS libraries: no browser, network or Python packages required.
rsvg = C.CDLL(ctypes.util.find_library('rsvg-2'))
cairo = C.CDLL(ctypes.util.find_library('cairo'))
gobject = C.CDLL(ctypes.util.find_library('gobject-2.0'))
rsvg.rsvg_handle_new_from_file.argtypes = [C.c_char_p, C.POINTER(C.c_void_p)]
rsvg.rsvg_handle_new_from_file.restype = C.c_void_p
rsvg.rsvg_handle_render_cairo.argtypes = [C.c_void_p,C.c_void_p]
rsvg.rsvg_handle_render_cairo.restype = C.c_int
cairo.cairo_image_surface_create.argtypes = [C.c_int,C.c_int,C.c_int]
cairo.cairo_image_surface_create.restype = C.c_void_p
cairo.cairo_create.argtypes = [C.c_void_p]
cairo.cairo_create.restype = C.c_void_p
cairo.cairo_surface_write_to_png.argtypes = [C.c_void_p,C.c_char_p]
cairo.cairo_surface_write_to_png.restype = C.c_int
cairo.cairo_destroy.argtypes = [C.c_void_p]
cairo.cairo_surface_destroy.argtypes = [C.c_void_p]
gobject.g_object_unref.argtypes = [C.c_void_p]
error = C.c_void_p()
handle = rsvg.rsvg_handle_new_from_file(str(svg_path).encode(),C.byref(error))
assert handle, 'SVG loading failed'
surface = cairo.cairo_image_surface_create(0,W,H)
context = cairo.cairo_create(surface)
assert rsvg.rsvg_handle_render_cairo(handle,context), 'SVG rendering failed'
assert cairo.cairo_surface_write_to_png(surface,str(OUT/'er.png').encode()) == 0
cairo.cairo_destroy(context)
cairo.cairo_surface_destroy(surface)
gobject.g_object_unref(handle)
print(f'Generated er.svg and er.png: {len(schema)} tables, {sum(map(len,schema.values()))} columns, {len(edges)} foreign keys')
for (parent,child),(field,cardinality,delete) in edges.items():
    print(f'{parent} [{cardinality}] — [0..*] {child}.{field}; ON DELETE {delete}')
