from pathlib import Path
from PIL import Image
import numpy as np
import json
r=Path.cwd();out=r/'dist/assets/floating';sizes={}
for id in ['1735','1737','1742','1743','1746','1747','1749']:
 im=Image.open(r/f'dist/assets/cutouts/{id}-880.webp').convert('RGBA');a=np.array(im.getchannel('A'));a=np.clip((a.astype(float)-22)*255/218,0,255).astype('uint8');im.putalpha(Image.fromarray(a));im=im.crop(im.getchannel('A').getbbox());pad=Image.new('RGBA',(im.width+16,im.height+16));pad.paste(im,(8,8));pad.save(out/f'{id}.webp','WEBP',quality=94,method=6);sizes[id]=pad.size
print(json.dumps(sizes))
