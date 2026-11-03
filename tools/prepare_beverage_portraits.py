"""Lightweight complete photographs; circular framing is CSS, without alpha masks."""
from pathlib import Path
from PIL import Image, ImageOps

root=Path(__file__).resolve().parents[1]
output=root/'dist/assets/beverage-portraits'
output.mkdir(exist_ok=True)
for number in ['1735','1737','1742','1747','1749']:
    with Image.open(root/f'items/IMG_{number}.JPG.jpeg') as original:
        photo=ImageOps.exif_transpose(original).convert('RGB')
        photo.thumbnail((640,880),Image.Resampling.LANCZOS)
        photo.save(output/f'{number}.webp','WEBP',quality=86,method=3)
