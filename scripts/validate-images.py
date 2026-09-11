"""Decode every production raster asset; container checks alone miss damaged WebP streams."""
from pathlib import Path
from PIL import Image
import sys

failures = []
count = 0
for path in sorted(Path('v1/assets/plants').rglob('*')):
    if path.suffix not in {'.png', '.webp'}:
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
