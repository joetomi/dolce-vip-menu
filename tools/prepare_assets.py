"""Non-generative segmentation. Original RGB pixels are retained; only alpha changes."""
from pathlib import Path
import json
from PIL import Image, ImageOps, ImageDraw
import numpy as np
import onnxruntime as ort
import cv2
from PIL import ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/assets/cutouts'
OUT.mkdir(parents=True, exist_ok=True)
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 2
session = ort.InferenceSession(str(ROOT/'.models/u2netp.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
report = []
for path in sorted((ROOT / 'items').glob('*.jpeg')):
    ident = path.name.split('_')[1].split('.')[0]
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    im.thumbnail((1200,1200))
    x = np.asarray(im.resize((320,320))).astype('float32') / 255
    x = (x - np.array([.485,.456,.406],dtype='float32')) / np.array([.229,.224,.225],dtype='float32')
    pred = session.run(None, {session.get_inputs()[0].name: x.transpose(2,0,1)[None]})[0][0,0]
    pred = (pred-pred.min()) / max(float(pred.max()-pred.min()),1e-8)
    alpha = Image.fromarray((pred*255).astype('uint8')).resize(im.size,Image.Resampling.LANCZOS)
    if ident == '9507':
        oval = Image.new('L',im.size)
        w,h = im.size
        ImageDraw.Draw(oval).ellipse((w*.111,h*.504,w*.91,h*.86),fill=255)
        alpha = Image.fromarray(np.maximum(np.array(alpha),np.array(oval))).filter(ImageFilter.GaussianBlur(.4))
    if ident == '9508':
        # Pale ceramic confused the model. Trace the actual oval rim, retaining source pixels.
        alpha = Image.new('L',im.size)
        w,h = im.size
        ImageDraw.Draw(alpha).ellipse((w*.126,h*.503,w*.915,h*.855),fill=255)
        alpha = alpha.filter(ImageFilter.GaussianBlur(.65))
    # Keep source color values; the model supplies segmentation only.
    rgba = im.convert('RGBA')
    rgba.putalpha(alpha)
    box = alpha.point(lambda p: 255 if p > 20 else 0).getbbox()
    if box:
        rgba = rgba.crop(box)
    for width in (440,880):
        sized = rgba.copy()
        sized.thumbnail((width,width))
        sized.save(OUT / f'{ident}-{width}.webp', quality=90, method=4)
    report.append({'id':ident,'source':str(path.relative_to(ROOT)), 'size':rgba.size, 'alpha':True})
    print(ident, rgba.size, flush=True)
(ROOT/'asset-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
# Contact sheet on olive background makes remaining background and clipped edges visible.
sheet = Image.new('RGB',(1200,((len(report)+3)//4)*250),'#747956')
d = ImageDraw.Draw(sheet)
for n,row in enumerate(report):
    im = Image.open(OUT/f"{row['id']}-440.webp")
    im.thumbnail((280,210))
    sheet.paste(im,((n%4)*300+(300-im.width)//2,(n//4)*250),im)
    d.text(((n%4)*300+12,(n//4)*250+220),row['id'],fill='white')
sheet.save(ROOT/'cutout-review.jpg')
