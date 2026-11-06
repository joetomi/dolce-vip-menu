"""Create the approval-only extended dessert menu. Never modifies dist."""
from pathlib import Path
from io import BytesIO
import pymupdf
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT/'source-assets/dessert-menu'
OUT = ROOT/'output/pdf'
TMP = ROOT/'tmp/pdfs'
OUT.mkdir(exist_ok=True, parents=True)
TMP.mkdir(exist_ok=True, parents=True)
source = pymupdf.open(ASSETS/'Original_Dessert_Menu.pdf')
W, H = 540, 960
# Sample the reference PDF's actual paper and ink, preserving its palette.
sample = source[0].get_pixmap(matrix=pymupdf.Matrix(1,1))
paper = tuple(v/255 for v in sample.pixel(10,10))
INK = '#30200f'
OLIVE = '#85886b'
pdfmetrics.registerFont(TTFont('Amiri', str(ASSETS/'Amiri-Regular.ttf')))
pdfmetrics.registerFont(TTFont('AmiriBold', str(ASSETS/'Amiri-Bold.ttf')))
pdfmetrics.registerFont(TTFont('English', 'C:/Windows/Fonts/times.ttf'))

def shape(s):
    return get_display(arabic_reshaper.reshape(s))

buf = BytesIO()
c = canvas.Canvas(buf, pagesize=(W,H))

def arabic(s,x,y,size=21,font='AmiriBold',align='right',color=INK):
    c.setFillColor(HexColor(color));c.setFont(font,size)
    getattr(c, {'right':'drawRightString','center':'drawCentredString'}[align])(x,H-y,shape(s))

def heading(ar,en,y):
    arabic(ar,488,y,22,'Amiri',color='#4d4d40')
    c.setFont('English',16);c.setFillColor(HexColor('#4d4d40'))
    c.drawRightString(488,H-y-22,en)
    c.setStrokeColor(HexColor('#d4d4be'));c.setLineWidth(1.5)
    c.line(501,H-y+19,501,H-y-25)

# Replace only the tiny original leader dots, leaving names and prices intact.
price_spans=[s for b in source[0].get_text('dict')['blocks'] for l in b.get('lines',[]) for s in l['spans'] if s['text'].strip().isdigit()]
# Currency stays physically to the left of each original price.
for price in price_spans:
    x,y=price['origin']
    c.setFont('Amiri',9);c.setFillColor(HexColor(INK))
    c.drawRightString(x-4,H-y,shape('د.ل'))

for drawing in source[0].get_drawings():
    r=drawing['rect']
    if 0<r.width<1 and 0<r.height<1:
        c.setFillColorRGB(*paper)
        c.rect(r.x0-.15,H-r.y1-.15,r.width+.3,r.height+.3,fill=1,stroke=0)
        nearest=min(price_spans,key=lambda s: abs(s['origin'][1]-r.y0)*10+abs(s['bbox'][2]-r.x0))
        c.setFillColor(HexColor('#978b77'))
        # All leaders sit just above the text baseline, like a full stop.
        c.circle((r.x0+r.x1)/2,H-nearest['origin'][1]+.6,.55,fill=1,stroke=0)

c.showPage();c.save()
overlay=pymupdf.open(stream=buf.getvalue(),filetype='pdf')
doc=pymupdf.open();page=doc.new_page(width=W,height=H)
page.draw_rect(page.rect,color=None,fill=paper)
# Preserve all original products and extras at their original size and positions.
page.show_pdf_page(pymupdf.Rect(0,0,540,825),source,0,clip=pymupdf.Rect(0,0,540,825))
page.show_pdf_page(page.rect,overlay,0)
# Move the original footer to the end; the logo appears exactly once.
page.show_pdf_page(pymupdf.Rect(0,840,540,960),source,0,clip=pymupdf.Rect(0,840,540,960))
doc.set_metadata({'title':'DOLCE | Desserts','author':'DOLCE SKY'})
pdf=OUT/'Dolce_Dessert_Menu.pdf'
doc.save(pdf,garbage=4,deflate=True)
for label,rect in [('current',pymupdf.Rect(0,0,540,960))]:
    page.get_pixmap(matrix=pymupdf.Matrix(2,2),clip=rect).save(TMP/f'dessert-studio-grid-{label}.png')
print(pdf)
