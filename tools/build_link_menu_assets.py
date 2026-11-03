"""Prepare the supplied menu pages for the single-page link menu."""

from pathlib import Path
from shutil import copy2
from io import BytesIO

import pymupdf
import requests
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "items" / "real menu" / "files"
TARGET = ROOT / "dist" / "assets" / "link-menu"
TARGET.mkdir(parents=True, exist_ok=True)

for number in (2, 3, 1):
    copy2(SOURCE / f"{number}.jpeg", TARGET / f"menu-{number}.jpeg")

pdf = pymupdf.open(SOURCE / "Dolce_Dessert_Menu.pdf")
for index, page in enumerate(pdf):
    pix = page.get_pixmap(matrix=pymupdf.Matrix(4, 4), alpha=False)
    image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    image.save(TARGET / f"dessert-{index + 1}.webp", "WEBP", quality=96, method=6)

remote = {
    "profile.webp": "https://cdn.hoobe.media/social/instagram/dolce.sky1-1793202839502.webp",
    "menu-cover.webp": "https://cdn.hoobe.media/pages/6ae21a68aa17a8e11b3cf0fd/link-1793203379271-b5uu8x20c-1793203500498.webp",
    "dessert-cover.webp": "https://cdn.hoobe.media/pages/6ae21a68aa17a8e11b3cf0fd/link-1793617473154-eswqwgevd-1793635832624.webp",
}
for name, url in remote.items():
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    image = Image.open(BytesIO(response.content)).convert("RGB")
    image.save(TARGET / name, "WEBP", quality=90, method=6)

for path in TARGET.iterdir():
    print(path.name, path.stat().st_size)
