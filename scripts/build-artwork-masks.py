"""Generate SVG clipping metadata. Approved JPEG bytes and colors stay unchanged.

Pale page backgrounds and their connected JPEG fringe are excluded. The output
is vector mask metadata; artwork is still the original, unmodified raster.
"""
from pathlib import Path
from PIL import Image
import json
from collections import deque

ROOT=Path(__file__).resolve().parents[1]

def crop(source, roi, viewbox, head=None):
    image=Image.open(ROOT/source).convert('RGB')
    x0,y0,x1,y1=roi
    # Flood only paper-colored pixels connected to the crop exterior. This
    # includes the darker JPEG matte/shadow fringe, while retaining enclosed
    # highlights. Never erode the whole silhouette: stems can be one pixel wide.
    background=set()
    queue=deque((x,y) for y in range(y0,y1) for x in range(x0,x1)
                if x in (x0,x1-1) or y in (y0,y1-1))
    seen=set()
    while queue:
        x,y=queue.popleft()
        if (x,y) in seen or not (x0<=x<x1 and y0<=y<y1):continue
        seen.add((x,y))
        r,g,b=image.getpixel((x,y))
        if min(r,g,b)>95 and max(r,g,b)-min(r,g,b)<85:
            background.add((x,y))
            queue.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1)))
    paths=[]
    for y in range(y0,y1):
        start=None
        for x in range(x0,x1+1):
            selected=x<x1 and (x,y) not in background
            if selected:
                r,g,b=image.getpixel((x,y))
                # Keep existing openings between leaves transparent too.
                selected=not(min(r,g,b)>174 and max(r,g,b)-min(r,g,b)<72)
            if head:selected=selected and head[0]<=x<head[2] and head[1]<=y<head[3]
            if selected and start is None:start=x
            if not selected and start is not None:
                paths.append(f'M{start} {y}h{x-start}v1h{start-x}z');start=None
    return {'asset':source,'artwork':{'viewBox':viewbox,'sourceWidth':image.width,'sourceHeight':image.height,'mask':''.join(paths)}}

SF='v1/assets/plants/approved/sunflower.jpeg'
MO='v1/assets/plants/approved/plants-3-8.jpeg'
# ROIs exclude captions, borders and neighboring plants. View boxes share a
# ground line within each species so growth never rescales the pot.
sf_centers=[87,237,386,535,685,835,985,1127]
sf_rois=[(33,450,143,559),(184,428,291,559),(332,408,439,560),(480,374,589,560),(631,374,739,560),(781,373,889,560),(931,367,1041,560),(1072,367,1182,560)]
mo_centers=[235,289,350,418,486,556,628,705]
mo_rois=[(215,238,258,293),(266,222,309,293),(327,207,374,293),(389,185,448,293),(458,149,516,293),(523,137,587,293),(589,126,666,293),(668,129,745,293)]
result={'sunflower':[],'monstera':[]}
for center,roi in zip(sf_centers,sf_rois):result['sunflower'].append(crop(SF,roi,[center-103,360,206,206]))
for center,roi in zip(mo_centers,mo_rois):result['monstera'].append(crop(MO,roi,[center-85,124,170,170]))
for stage,head in [(6,(804,373,866,433)),(7,(941,367,1030,453)),(8,(1083,367,1178,457))]:
    index=stage-1;center=sf_centers[index];layer=crop(SF,sf_rois[index],[center-103,360,206,206],head)
    layer.update(cx=((head[0]+head[2])/2-(center-103))/206*100,cy=((head[1]+head[3])/2-360)/206*100,scale=1.06)
    result['sunflower'][index]['flowerAnimation']={'layers':[layer]}
(ROOT/'v1/js/artwork.js').write_text('window.WT_V1_ARTWORK = '+json.dumps(result,separators=(',',':'))+';\n')
print('Built source-preserving masks for 16 stages and 3 flower overlays.')
