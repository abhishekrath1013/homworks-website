"""Downloads small previews of Pexels photo IDs and builds labelled contact sheets for review.
usage: python tools/fetch_candidates.py <outdir> <id> <id> ...
"""
import sys, os, urllib.request, io
from PIL import Image, ImageDraw

out = sys.argv[1]; ids = sys.argv[2:]
os.makedirs(out, exist_ok=True)
got = []
for i in ids:
    p = os.path.join(out, i + '.jpg')
    if not os.path.exists(p):
        try:
            u = 'https://images.pexels.com/photos/%s/pexels-photo-%s.jpeg?auto=compress&cs=tinysrgb&w=520' % (i, i)
            d = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=25).read()
            open(p, 'wb').write(d)
        except Exception as ex:
            print('fail', i, ex); continue
    got.append(i)
per = 12
for s in range(0, len(got), per):
    chunk = got[s:s + per]
    sheet = Image.new('RGB', (4 * 330, 3 * 260), 'white')
    for k, i in enumerate(chunk):
        im = Image.open(os.path.join(out, i + '.jpg')).convert('RGB'); im.thumbnail((322, 232))
        x, y = (k % 4) * 330, (k // 4) * 260
        sheet.paste(im, (x, y)); ImageDraw.Draw(sheet).text((x + 4, y + 238), i, fill='black')
    sheet.save(os.path.join(out, 'sheet_%d.png' % (s // per)))
print(len(got), 'ok')
