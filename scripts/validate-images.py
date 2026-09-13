"""Decode every production raster asset; container checks alone miss damaged WebP streams."""
from pathlib import Path
from PIL import Image
import sys

failures = []
count = 0
for path in sorted(Path('v1/assets/plants').rglob('*')):
    if path.suffix not in {'.png', '.webp', '.jpeg'}:
        continue
    try:
        with Image.open(path) as image:
            image.load()
        count += 1
    except Exception as error:
        failures.append(f'{path}: {error}')
if failures:
    print('\n'.join(failures), file=sys.stderr)
    sys.exit(1)
print(f'{count} raster plant assets decoded successfully.')

# Guard against the reported missing-pot-pixels regression using independent
# interior points in the approved sunflower sprout (not background pixels).
import json, re, hashlib
source=Path('v1/js/artwork.js').read_text()
art=json.loads(source.removeprefix('window.WT_V1_ARTWORK = ').strip().removesuffix(';'))
sprout=art['sunflower'][1]
runs=[tuple(map(int,m)) for m in re.findall(r'M(\d+) (\d+)h(\d+)v1h-\d+z',sprout['artwork']['mask'])]
for x,y in [(230,520),(238,520),(246,520),(237,473),(220,446),(253,446)]:
    assert any(ry==y and rx<=x<rx+width for rx,ry,width in runs), f'Sunflower sprout has a hole at {x},{y}'
print('Sunflower sprout pot, stem and leaf interior points remain opaque.')

# Background fringe beside the sprout pot must not return.
for x,y in [(194,543),(280,543)]:
    assert not any(ry==y and rx<=x<rx+width for rx,ry,width in runs), f'Sunflower matte remains at {x},{y}'
print('Sunflower exterior matte points remain transparent.')
