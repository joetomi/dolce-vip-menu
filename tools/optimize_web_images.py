"""Build web delivery copies; keep all original assets unchanged."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
assets = root / 'dist/assets'
source = assets / 'floating'
output = assets / 'web'
output.mkdir(exist_ok=True)
report = []
for path in sorted(source.glob('[0-9]*.webp')):
    image = Image.open(path).convert('RGBA')
    image.save(output / path.name, 'WEBP', quality=86, method=3)
    mobile = image.copy()
    if image.width > 480:
        mobile = image.resize((480, round(image.height * 480 / image.width)), Image.Resampling.LANCZOS)
        mobile.save(output / f'{path.stem}-480.webp', 'WEBP', quality=86, method=3)
    report.append({'name': path.name, 'before': path.stat().st_size,
                   'after': (output / path.name).stat().st_size,
                   'mobile': (output / f'{path.stem}-480.webp').stat().st_size if image.width > 480 else (output / path.name).stat().st_size})

paper_path = source / 'botanical-paper.webp'
paper = Image.open(source / 'botanical-paper-original.png').convert('RGB')
paper = paper.resize((960, 960), Image.Resampling.LANCZOS)
paper.save(output / 'botanical-paper.webp', 'WEBP', quality=86, method=3)
report.append({'name':'botanical-paper.webp','before':paper_path.stat().st_size,'after':(output/'botanical-paper.webp').stat().st_size,'mobile':(output/'botanical-paper.webp').stat().st_size})
logo = Image.open(assets / 'logo.png').convert('RGBA')
logo.save(output / 'logo.webp', 'WEBP', lossless=True, method=3)
report.append({'name':'logo.webp','before':(assets/'logo.png').stat().st_size,'after':(output/'logo.webp').stat().st_size,'mobile':(output/'logo.webp').stat().st_size})
(root / 'qa/image-optimization.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
before = sum(x['before'] for x in report)
after = sum(x['after'] for x in report)
mobile = sum(x['mobile'] for x in report)
print(json.dumps({'before_bytes':before,'desktop_bytes':after,'mobile_bytes':mobile,'mobile_reduction_percent':round(100*(1-mobile/before),1),'files':report}))

