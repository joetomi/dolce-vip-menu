from PIL import Image, ImageOps, ImageDraw, ImageFilter
import numpy as np, onnxruntime as ort
opt=ort.SessionOptions();opt.intra_op_num_threads=2
s=ort.InferenceSession('.models/u2netp.onnx',sess_options=opt,providers=['CPUExecutionProvider'])
im=ImageOps.exif_transpose(Image.open('items/IMG_9507.JPG.jpeg')).convert('RGB');im.thumbnail((1200,1200));w,h=im.size
x=np.asarray(im.resize((320,320))).astype('float32')/255;x=(x-np.array([.485,.456,.406],dtype='float32'))/np.array([.229,.224,.225],dtype='float32')
p=s.run(None,{s.get_inputs()[0].name:x.transpose(2,0,1)[None]})[0][0,0];p=(p-p.min())/(p.max()-p.min());a=Image.fromarray((p*255).astype('uint8')).resize(im.size,Image.Resampling.LANCZOS)
e=Image.new('L',im.size);ImageDraw.Draw(e).ellipse((w*.111,h*.504,w*.91,h*.86),fill=255)
a=Image.fromarray(np.maximum(np.array(a),np.array(e))).filter(ImageFilter.GaussianBlur(.4));im=im.convert('RGBA');im.putalpha(a);im=im.crop(a.point(lambda p:255 if p>20 else 0).getbbox())
for size in (440,880):
 o=im.copy();o.thumbnail((size,size));o.save(f'dist/assets/cutouts/9507-{size}.webp',quality=92,method=4)
