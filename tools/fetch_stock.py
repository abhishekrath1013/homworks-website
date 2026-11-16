"""Downloads the chosen Pexels stock photos (free licence, no attribution required) into assets/stock/ as webp.
Pexels licence: https://www.pexels.com/license/  - photo IDs are listed in assets/stock/SOURCES.md
"""
import os, io, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'stock')
os.makedirs(OUT, exist_ok=True)
PHOTOS = {
    'kit-island': 8583735, 'kit-l': 8031909, 'kit-u': 4713242, 'kit-galley': 19857263, 'kit-one': 7535076, 'kit-pen': 280232,
    'kit-modern': 6283972, 'kit-warm': 10153052, 'kit-white': 2724749,
    'living-tv': 3423817, 'living-2': 6186813, 'living-3': 6527067,
    'ward-1': 6585750, 'ward-2': 7195887, 'ward-3': 6580406, 'ward-4': 6585617, 'ward-5': 7534288,
    'bed-1': 31737843, 'bed-2': 6123304, 'bed-3': 15692775, 'bed-4': 6752295,
    'kids-1': 3958960, 'kids-2': 4221413, 'kids-3': 10854908, 'kids-4': 19889143,
    'shop-1': 18947396, 'shop-2': 5973919, 'shop-3': 32357250, 'shop-wood': 12278585,
    'cnc-1': 14805031, 'cnc-2': 9242913, 'cnc-3': 7480242, 'samples': 6568684,
    'plan-1': 8961295, 
    'fam-1': 14798018, 'fam-2': 8819065, 'cook-1': 9346161, 'cook-2': 9345640, 'shop-4': 18947381, 'shop-5': 37384622,
    'lm-coimbatore': 17812112, 'lm-chennai': 31653799, 'lm-bangalore': 29183751, 'lm-erode': 29297994, 'lm-hyderabad': 12354645, 'lm-guwahati': 34198409,
    'inst-1': 15124970, 'inst-2': 7303850,
    'entry-1': 6758782, 'entry-2': 7546771, 'entry-3': 7061065,
}
lines = ['# Stock photo sources (Pexels, free to use, no attribution required)', '']
for name, pid in PHOTOS.items():
    dst = os.path.join(OUT, name + '.webp')
    if not os.path.exists(dst):
        u = 'https://images.pexels.com/photos/%d/pexels-photo-%d.jpeg?auto=compress&cs=tinysrgb&w=1600' % (pid, pid)
        d = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=40).read()
        Image.open(io.BytesIO(d)).convert('RGB').save(dst, quality=78, method=6)
    lines.append('- %s: https://www.pexels.com/photo/%d/' % (name, pid))
open(os.path.join(OUT, 'SOURCES.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(len(PHOTOS), 'photos')
