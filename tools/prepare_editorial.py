"""Create lightweight web copies of Dolce's original photographs.

The source JPEGs in items/ stay untouched. Cropping is handled responsively in CSS.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "items"
TARGET = ROOT / "dist" / "assets" / "editorial"
TARGET.mkdir(parents=True, exist_ok=True)

for source in sorted(SOURCE.glob("IMG_*.jpeg")):
    number = source.name.split("_")[1].split(".")[0]
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((1500, 2000), Image.Resampling.LANCZOS)
        output = TARGET / f"{number}.webp"
        image.save(output, "WEBP", quality=86, method=5)
        print(f"{number}: {image.width}x{image.height} -> {output.stat().st_size // 1024} KiB")
