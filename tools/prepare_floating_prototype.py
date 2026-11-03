from pathlib import Path
from PIL import Image
import numpy as np
r=Path.cwd();dest=r/'dist/assets/floating'
bg=Image.open(dest/'botanical-paper-original.png').convert('RGB');bg.save(dest/'botanical-paper.webp','WEBP',quality=95,method=6)
for id in ['9507','1749','9517','9576','9573']:
 im=Image.open(r/f'dist/assets/cutouts/{id}-880.webp').convert('RGBA')
 a=np.array(im.getchannel('A'));a=np.clip((a.astype(float)-22)*255/218,0,255).astype('uint8');im.putalpha(Image.fromarray(a))
 bbox=im.getchannel('A').getbbox();im=im.crop(bbox);pad=Image.new('RGBA',(im.width+16,im.height+16));pad.paste(im,(8,8));pad.save(dest/f'{id}.webp','WEBP',quality=94,method=6)
 print(id,pad.size,'transparent',np.count_nonzero(np.asarray(pad)[:,:,3]==0),'opaque',np.count_nonzero(np.asarray(pad)[:,:,3]==255))
canvas=bg.resize((800,800))
for id,xy,wh in [('9507',(90,65),(620,420)),('1749',(500,450),(170,300))]:
 im=Image.open(dest/f'{id}.webp');im.thumbnail(wh);canvas.paste(im,xy,im)
canvas.save(r/'qa/floating-alpha-review.jpg',quality=96)

