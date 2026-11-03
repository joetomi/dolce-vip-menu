"""Build the breakfast PDF first, then render the web menu from its page."""
from pathlib import Path
from io import BytesIO
import subprocess

import arabic_reshaper
from bidi.algorithm import get_display
from fontTools.ttLib import TTFont as FontToolsFont
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image
import pymupdf
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
TEMP = ROOT / 'tmp/pdfs'
ASSETS = ROOT / 'dist/assets/link-menu'
for directory in (OUT, TEMP, ASSETS):
    directory.mkdir(parents=True, exist_ok=True)

# Reuse the complete Arabic font embedded in the supplied dessert menu.
reference = pymupdf.open(ROOT / 'items/real menu/files/Dolce_Dessert_Menu.pdf')
font_xref = next(font[0] for font in reference[0].get_fonts() if font[4] == 'AccessibleTitle')
arabic_font = BytesIO(reference.extract_font(font_xref)[3])
pdfmetrics.registerFont(TTFont('MenuArabic', arabic_font))
script_path = 'C:/Windows/Fonts/ITCEDSCR.TTF'
pdfmetrics.registerFont(TTFont('MenuScript', script_path))
pdfmetrics.registerFont(TTFont('MenuSerif', 'C:/Windows/Fonts/GARA.TTF'))

INK = '#33200e'
OLIVE = '#85886a'
PAPER = '#f8f4eb'
WIDTH, HEIGHT = 540, 960
pdf_path = OUT / 'Dolce_Breakfast_Menu.pdf'
c = canvas.Canvas(str(pdf_path), pagesize=(WIDTH, HEIGHT))
c.setTitle('DOLCE SKY | Breakfast')
c.setAuthor('DOLCE SKY')
c.setFillColor(HexColor(PAPER))
c.rect(0, 0, WIDTH, HEIGHT, stroke=0, fill=1)

def text(value, x, top, size, font='MenuArabic', align='right', color=INK):
    c.setFillColor(HexColor(color))
    c.setFont(font, size)
    if font == 'MenuArabic':
        value = get_display(arabic_reshaper.reshape(value))
    getattr(c, {'right': 'drawRightString', 'left': 'drawString', 'center': 'drawCentredString'}[align])(x, HEIGHT-top, value)

def rule(left, right, top, color=OLIVE):
    c.setStrokeColor(HexColor(color))
    c.setLineWidth(.55)
    c.line(left, HEIGHT-top, right, HEIGHT-top)

text('Breakfast', 42, 115, 76, 'MenuScript', 'left')
rule(333, 494, 103)
text('التوست', 492, 185, 24, color=OLIVE)
text('TOAST', 48, 183, 12, 'MenuSerif', 'left', OLIVE)
rule(48, 492, 198)

toast = [
    ('بيتزا التوست أجبان', 'صلصة طماطم - زيتون - جبن', 35),
    ('بيتزا التوست خضراوات', 'جبنة - صلصة طماطم - تشكيلة خضروات', 33),
    ('بيتزا التوست دجاج', 'صلصة طماطم - دجاج - جبنة', 36),
    ('هلتي توست', 'جبنة كريمي - صوص أفوكادو - أفوكادو - طماطم - خيار - زيتون', 40),
    ('بيتزا التوست تونريو', 'صلصة طماطم - تونة - زيتون - جبن', 35),
]
for index, (name, ingredients, price) in enumerate(toast):
    top = 236 + index * 66
    text(name, 492, top, 23)
    text(str(price), 48, top, 24, 'MenuSerif', 'left')
    text('د.ل', 86, top, 12)
    text(ingredients, 492, top + 24, 13, color='#74644e')

text('سندوتشات باردة', 492, 591, 24, color=OLIVE)
text('COLD SANDWICHES', 48, 589, 12, 'MenuSerif', 'left', OLIVE)
rule(48, 492, 604)
sandwiches = [
    ('سندوتش دجاج بيستو', 36),
    ('سندوتش تونة وجبن', 35),
    ('سندوتش أومليت بالجبن', 34),
    ('كرواسون كلوب', 35),
]
for index, (name, price) in enumerate(sandwiches):
    top = 645 + index * 46
    text(name, 492, top, 23)
    text(str(price), 48, top, 24, 'MenuSerif', 'left')
    text('د.ل', 86, top, 12)
text('DOLCE', WIDTH/2, 903, 40, 'MenuSerif', 'center')
c.showPage()
c.save()

# Render the completed PDF; web imagery is always derived from this artifact.
subprocess.run(['pdftoppm', '-scale-to', '3840', '-singlefile', '-png', str(pdf_path), str(TEMP/'breakfast-1')], check=True)
with Image.open(TEMP/'breakfast-1.png') as page:
    page.convert('RGB').save(ASSETS/'breakfast-1.webp', 'WEBP', quality=96, method=6)

# Font outlines keep the new card wordmark crisp and self-contained.
font = FontToolsFont(script_path)
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
paths, cursor = [], 0
for char in 'Breakfast':
    name = cmap[ord(char)]
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(pen)
    paths.append(f'<path transform="translate({cursor} 0)" d="{pen.getCommands()}"/>')
    cursor += font['hmtx'][name][0]
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-260 -1500 {cursor+520} 2250"><g fill="{INK}" transform="scale(1 -1)">{"".join(paths)}</g></svg>'
(ASSETS/'breakfast-wordmark.svg').write_text(svg, encoding='utf-8')
print(pdf_path)
print('Web menu bytes:', (ASSETS/'breakfast-1.webp').stat().st_size)
