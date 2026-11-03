from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance
R=Path(__file__).resolve().parents[1]
T=R/'dist/assets/print';T.mkdir(parents=True,exist_ok=True)
# Explicit source rectangles: x0,y0,x1,y1 as fractions. No synthesized pixels.
crops={'9508':(0,.49,1,.865),'9573':(0,.43,1,.805),'9507':(0,.43,1,.87),'9517':(0,.48,1,.91),'9576':(0,.22,1,.83),'1749':(.12,.22,.88,.95),'1735':(.12,.20,.88,.96),'9517-tall':(0,.38,1,1),'9573-tall':(0,.40,1,.95),'9508-tall':(0,.43,1,.96)}
for id,box in crops.items():
 im=ImageOps.exif_transpose(Image.open(R/f'items/IMG_{id.split('-')[0]}.JPG.jpeg')).convert('RGB');w,h=im.size
 im=im.crop(tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(box)))
 im=ImageEnhance.Brightness(im).enhance(1.035);im=ImageEnhance.Color(im).enhance(.97)
 im.thumbnail((1800,1800),Image.Resampling.LANCZOS);im.save(T/f'{id}.webp',quality=91,method=5)
 print(id,im.size)
q=R/'dist/qa';q.mkdir(exist_ok=True)
im=Image.open(r'C:/Users/USER/AppData/Local/Temp/codex-clipboard-3f8457ab-b0e2-4a33-80a7-c94baa04a1e3.jpg')
im.crop((7,740,668,1083)).save(q/'reference-pair.jpg',quality=96)

