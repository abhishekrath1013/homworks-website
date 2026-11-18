"""Generates the Homworks inner pages as static, crawlable HTML in the homepage theme.

Run:  node tools/extract_data.js tools/data.json && python tools/fetch_stock.py && python tools/build_inner.py
Only facts that already exist on the homepage, in the Interior Guide data or in the old site data are used.
Photography on inner pages is Pexels stock (see assets/stock/SOURCES.md); home5/work-* are Homworks' own featured works.
"""
import json, os, re, html, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'tools', 'data.json'), encoding='utf-8'))
SITE = 'https://homworks.com'          # canonical base; change here if the live domain differs
PHONE, PHONE_TEL, EMAIL = '1800 833 4500', '18008334500', 'enquiry@homworks.com'
FOOT30 = '* Guarantee excludes client-side delays, design changes, site readiness. +10 days for North East India and out-of-inventory finishes.'
e = lambda t: html.escape(t, quote=True)
ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
ST = lambda n: 'assets/stock/%s.webp' % n

KL = D['KL']; CITIES = D['CITIES']; GD = D['GD']; P = D['P']; FIN = D['FIN']
KSTOCK = {'l-shaped': 'kit-l', 'u-shaped': 'kit-u', 'galley': 'kit-galley', 'one-wall': 'kit-one', 'peninsular': 'kit-pen', 'island': 'kit-island'}
STREET = {'coimbatore': ('538/2, Airport Service Rd, Peelamedu, Alagu Nagar, Civil Aerodrome Post', 'Coimbatore', 'Tamil Nadu', '641014'),
          'chennai': ('Plot No: 492, 200 Feet Radial Road, Indirajit Avenue, Kovilambakkam', 'Chennai', 'Tamil Nadu', '600117'),
          'bangalore': ('#37/5 (New Pid No.6), 13th Cross, 30th Main, Banashankari 2nd Stage', 'Bengaluru', 'Karnataka', '560070'),
          'erode': ('108/1, Perundurai Road, Near Ambal Autos, Kumalan Kuttai', 'Erode', 'Tamil Nadu', '638011'),
          'hyderabad': ('ABC Spacery, Opp. Mayfair Convention Center, Shamshabad', 'Hyderabad', 'Telangana', '501218'),
          'guwahati': ('R K Metals, NH37, Opp. Nidhi Bhavan, Lalmati, Near AEE Tower', 'Guwahati', 'Assam', '781029')}
CITY_BLURB = {
    'coimbatore': 'Corporate office and home of the Homworks factory, where every module starts its journey.',
    'chennai': 'The Kovilambakkam centre, serving homes across Chennai.',
    'bangalore': 'The Banashankari centre, serving homes across Bengaluru.',
    'erode': 'The Perundurai Road centre, serving homes in and around Erode.',
    'hyderabad': 'The Shamshabad centre, serving homes across Hyderabad.',
    'guwahati': 'The Lalmati centre, serving homes in Guwahati and the North East.'}
LM = {'coimbatore': ('lm-coimbatore', 'Adiyogi, Coimbatore'), 'chennai': ('lm-chennai', 'Chennai Lighthouse, Marina Beach'), 'bangalore': ('lm-bangalore', 'Vidhana Soudha, Bengaluru'),
      'erode': ('lm-erode', 'Temple gopuram, Tamil Nadu'), 'hyderabad': ('lm-hyderabad', 'Charminar, Hyderabad'), 'guwahati': ('lm-guwahati', 'The Brahmaputra, Guwahati')}
CITY_IMG = ['kit-white', 'kit-l', 'kit-island', 'bed-1', 'living-2', 'kit-modern']
BUILT = set()

# ------------------------------------------------------------------ chrome
SHOW_SOON = False   # flip to True once the Case Studies, Customer Stories and Blog pages have content
NAV = [
    ('Interiors', 'interiors.html', [
        ('Rooms', [('Full Home Interiors', 'Design-to-installation for every room', 'full-home-interiors.html'),
                   ('Modular Kitchens', 'Six engineered layouts to pick from', 'modular-kitchens.html'),
                   ('Living Rooms', 'Storage and TV units built for family life', 'living-rooms.html'),
                   ('Bedrooms', 'Restful layouts, wardrobes and kids rooms', 'bedrooms.html')])],
     ('@logo', 'Production and installation in 30 working days from design sign-off.', '30-day-delivery.html', 'See the 30-day promise')),
    ('Projects', 'projects.html', [
        ('Explore homes', [('Project Gallery', 'Real homes, made in our own factory', 'projects.html'),
                           ('Case Studies', 'The full story behind three homes', 'customer-stories.html', 'soon'),
                           ('Customer Stories', 'Reviews, in homeowners’ own words', 'customer-stories.html', 'soon')]),
        ('Browse by', [('City', 'See projects near you', 'locations.html'), ('Room Type', 'Kitchens, bedrooms and more', 'interiors.html'),
                       ('Full Home', 'Whole-home transformations', 'full-home-interiors.html')])],
     ('See it built', 'Find a home like yours.', 'Browse the homes we have crafted from the ground up.', 'projects.html', 'Open the gallery')),
]
TOP = [('Location', 'locations.html'), ('About us', 'about-us.html'), ('Blogs', 'blog.html', 'soon'), ('Contact', 'contact.html')]


def lk(u, extra=''):
    """Pages that are built link through; the rest stay inert (href="#") until they exist."""
    return 'href="%s"%s' % (u, extra) if u.split('#')[0] in BUILT else 'href="#" data-href="%s"%s' % (u, extra)


def nav_html(active='', home=False):
    out = []
    cur = lambda u: ' aria-current="page"' if active == u else ''
    for label, href, cols, feat in NAV:
        h = '<div class="ni"><a class="ni-a" %s aria-haspopup="true">%s</a><div class="mega%s" role="group" aria-label="%s">' % (lk(href, cur(href)), label, ' m1' if len(cols) == 1 else '', label)
        for ch, links in cols:
            h += '<div class="mg-col"><h4>%s</h4>' % e(ch)
            for l in links:
                if len(l) > 3 and l[3] == 'soon' and not SHOW_SOON:
                    continue
                h += '<a class="mg-link" %s><b>%s</b><small>%s</small></a>' % (lk(l[2]), e(l[0]), e(l[1]))
            h += '</div>'
        if feat[0] == '@logo':
            h += '<div class="mg-feat mg-logo"><img src="assets/home5/30days.webp" alt="30 days or it’s free*" width="373" height="276"><p>%s</p><a %s>%s <i>→</i></a></div></div></div>' % (e(feat[1]), lk(feat[2]), e(feat[3]))
        else:
            h += '<div class="mg-feat"><span>%s</span><b>%s</b><p>%s</p><a %s>%s <i>→</i></a></div></div></div>' % (e(feat[0]), e(feat[1]), e(feat[2]), lk(feat[3]), e(feat[4]))
        out.append(h)
    for t in TOP:
        if len(t) > 2 and t[2] == 'soon' and not SHOW_SOON:
            continue
        out.append('<div class="ni"><a class="ni-a" %s>%s</a></div>' % (lk(t[1], cur(t[1])), t[0]))
    nav = '<nav class="nav-links" aria-label="Primary">\n    ' + '\n    '.join(out) + '\n  </nav>'
    cta = '#contact' if home else 'contact.html'
    mob = '<nav class="mnav" id="mnav" aria-label="Mobile">\n' + ''.join('  <a %s>%s</a>\n' % (lk(h), l) for l, h in
          [('Interiors', 'interiors.html'), ('Projects', 'projects.html'), ('Location', 'locations.html'), ('About us', 'about-us.html')] + ([('Blogs', 'blog.html')] if SHOW_SOON else []) + [('Contact', 'contact.html')]) + \
          '  <a class="go" href="%s">Book a FREE Consultation</a>\n</nav>' % cta
    return nav, mob, cta


def header_html(active='', home=False):
    nav, mob, cta = nav_html(active, home)
    return ('<header class="nav" id="nav">\n  <a class="nav-logo" href="index.html" aria-label="Homworks home"><img src="assets/home5/logo-nav.svg" alt="Homworks" width="176" height="42"></a>\n  '
            + nav + '\n  <a class="nav-cta" href="%s">Book a FREE Consultation</a>\n' % cta +
            '  <button class="nav-burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>\n</header>\n' + mob)


def footer_core():
    return '''<footer class="foot">
  <div class="foot-cols">
    <div class="fc-brand">
      <img class="logo" src="assets/home5/logo-footer.svg" alt="Homworks" width="176" height="42">
      <p class="about">Thoughtful home interiors, crafted for the way India lives now. Engineered in our own Coimbatore factory, and built for longevity.</p>
    </div>
    <div class="fc-links">
      <h4>Quick Links</h4>
      <ul><li><a href="index.html">Home</a></li><li><a href="about-us.html">About Us</a></li><li><a href="how-it-works.html">Our Process</a></li><li><a href="projects.html">Featured Works</a></li><li><a href="faqs.html">FAQs</a></li></ul>
    </div>
    <div class="fc-serv">
      <h4>Our Services</h4>
      <ul><li><a href="full-home-interiors.html">Full Home Interiors</a></li><li><a href="modular-kitchens.html">Modular Kitchens</a></li><li><a href="living-rooms.html">Living Rooms</a></li><li><a href="bedrooms.html">Bedrooms</a></li><li><a href="wardrobes.html">Wardrobes</a></li></ul>
    </div>
    <div class="fc-contact">
      <h4>Coimbatore Office</h4>
      <p>538/2, Airport Service Rd, Peelamedu, Alagu Nagar, Civil Aerodrome Post, Coimbatore – 641014</p>
      <p class="w">Phone: <a href="tel:%s">%s</a></p>
      <p class="w">Inquiries: <a href="mailto:%s">%s</a></p>
    </div>
  </div>
</footer>''' % (PHONE_TEL, PHONE, EMAIL, EMAIL)


WA = '<a class="wa" href="https://wa.me/918925811898" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M9.2 8.8c.2 2.3 2.7 4.8 5 5l1.3-1.4-1.9-1-.8.7a4 4 0 0 1-1.8-1.8l.7-.8-1-1.9-1.5 1.2Z"/></svg></a>'


def footer_html():
    return footer_core() + '\n' + WA


# ------------------------------------------------------------------ schema
def ld(obj): return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + '</script>'

ORG = {'@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', '@id': SITE + '/#org', 'name': 'Homworks', 'legalName': 'Stylcove Modulars Pvt Ltd',
       'url': SITE + '/', 'logo': SITE + '/assets/homworks-logo.png', 'image': SITE + '/assets/home5/hero-after.webp', 'telephone': PHONE, 'email': EMAIL,
       'description': 'Homworks designs, manufactures and installs home interiors in its own Coimbatore factory, with a 30-day delivery promise and a 10-year warranty.',
       'areaServed': [c['name'] for c in CITIES], 'address': {'@type': 'PostalAddress', 'streetAddress': STREET['coimbatore'][0], 'addressLocality': 'Coimbatore', 'addressRegion': 'Tamil Nadu', 'postalCode': '641014', 'addressCountry': 'IN'}}


def crumbs_ld(items):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + '/' + (u if u != 'index.html' else '')} for i, (n, u) in enumerate(items)]}


def faq_ld(qas):
    return {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in qas]}


# ------------------------------------------------------------------ small helpers
CUR = []   # sections of the page being built, for the recap


def slug(t): return re.sub(r'[^a-z0-9]+', '-', re.sub(r'<[^>]+>', '', t).lower()).strip('-')


def cnum(s):
    """Wrap the first number in a fact so it counts up from 0 on scroll."""
    s = s.strip()
    m = re.match(r'^(\D*?)(\d[\d,]*)(.*)$', s)
    if not m or s.startswith(('Day', 'E0', '1800')) or re.match(r'^\D*\d+ \(', s):
        return e(s)
    pre, num, suf = m.groups()
    return '%s<span class="cnt" data-to="%s"%s>%s</span>%s' % (e(pre), num.replace(',', ''), ' data-c="1"' if ',' in num else '', num, e(suf))


def img(src, alt, eager=False, cls='', par=False):
    return '<img src="%s" alt="%s"%s%s %s>' % (src, e(alt), ' class="%s"' % cls if cls else '', ' data-par' if par else '', 'fetchpriority="high"' if eager else 'loading="lazy"')


def crumb(items, light=False):
    return '<nav class="crumb%s" aria-label="Breadcrumb">' % (' light' if light else '') + '<i>/</i>'.join(
        ('<a href="%s">%s</a>' % (u, e(n)) if u else '<span aria-current="page">%s</span>' % e(n)) for n, u in items) + '</nav>'


def btns(ctas, extra=''):
    return '<div class="btns%s">' % extra + ''.join('<a class="btn %s" href="%s">%s%s</a>' % (k, u, e(l), ARROW if k in ('solid', 'pink') else '') for l, u, k in ctas) + '</div>'


def facts_ul(facts, cls='facts'):
    return '<ul class="%s">' % cls + ''.join('<li><b>%s</b><span>%s</span></li>' % (cnum(x), e(y)) for x, y in facts) + '</ul>' if facts else ''


# ------------------------------------------------------------------ heroes (four different openings)
def hero_split(crumbs, eyebrow, h1, lede, ctas, facts, image, alt, pill=None, glass=None, rev=False):
    CUR.clear()
    g = ''
    if glass:
        g = '<div class="glass"><h4>%s</h4><ul>%s</ul></div>' % (e(glass[0]), ''.join('<li>%s</li>' % e(x) for x in glass[1]))
    p = '<span class="pill"><i></i><span>%s</span></span>' % e(pill) if pill else ''
    return '''<section class="ph2%s"><div class="wrap ph2-in">
  <div class="rv">%s<p class="eyebrow">%s</p><h1>%s</h1><p class="lede">%s</p>%s%s</div>
  <div class="ph2-img rv d1"><figure>%s</figure>%s%s</div>
</div></section>''' % (' rev' if rev else '', crumb(crumbs), e(eyebrow), h1, e(lede), btns(ctas), facts_ul(facts), img(image, alt, True), p, g)


def hero_full(crumbs, eyebrow, h1, lede, ctas, facts, image, alt, dark=False):
    CUR.clear()
    return '''<section class="hf%s"><div class="hf-bg">%s</div><div class="hf-shade"></div>
  <div class="wrap hf-in"><div class="hf-t">%s<p class="eyebrow">%s</p><h1>%s</h1><p class="lede">%s</p>%s</div></div>
  <div class="wrap hf-fw">%s</div></section>''' % (' dark' if dark else '', img(image, alt, True, par=True), crumb(crumbs, True), e(eyebrow), h1, e(lede), btns(ctas), facts_ul(facts, 'hf-facts'))


def hero_collage(crumbs, eyebrow, h1, lede, ctas, facts, imgs, pill=None):
    CUR.clear()
    a, b, c = imgs
    p = '<span class="pill"><i></i><span>%s</span></span>' % e(pill) if pill else ''
    return '''<section class="ph2 hco"><div class="wrap ph2-in">
  <div class="rv">%s<p class="eyebrow">%s</p><h1>%s</h1><p class="lede">%s</p>%s%s</div>
  <div class="hco-g rv d1"><figure class="a">%s</figure><figure class="b">%s</figure><figure class="c">%s</figure>%s</div>
</div></section>''' % (crumb(crumbs), e(eyebrow), h1, e(lede), btns(ctas), facts_ul(facts), img(a[0], a[1], True), img(b[0], b[1], True), img(c[0], c[1], True), p)


def hero_type(crumbs, eyebrow, h1, lede, ctas, extra='', strip=None, dark=False):
    CUR.clear()
    s = ''
    if strip:
        s = '<div class="mqi" aria-hidden="true"><div class="mqi-t">%s</div></div>' % ''.join('<figure>%s</figure>' % img(x, '') for x in strip * 2)
    return '''<section class="ht%s"><div class="wrap ht-in"><div class="rv">%s<p class="eyebrow">%s</p><h1>%s</h1><p class="lede">%s</p>%s%s</div></div>%s</section>''' % (
        ' dark' if dark else '', crumb(crumbs, dark), e(eyebrow), h1, e(lede), btns(ctas, ' c'), extra, s)


# ------------------------------------------------------------------ sections
def sh(eyebrow, h2, p='', center=False):
    return '<div class="sh%s rv"><div><p class="eyebrow">%s</p><h2 class="h2">%s</h2></div>%s</div>' % (' c' if center else '', e(eyebrow), h2, '<p>%s</p>' % e(p) if p else '')


def section(inner, cls='', title=None, summ=''):
    sid = ''
    if title:
        sid = slug(title); CUR.append((title, sid, summ))
    return '<section class="sec %s"%s><div class="wrap">%s</div></section>' % (cls, ' id="%s" data-title="%s"' % (sid, e(title)) if title else '', inner)


def full(inner, cls='', title=None, summ=''):
    sid = ''
    if title:
        sid = slug(title); CUR.append((title, sid, summ))
    return '<section class="sec %s"%s>%s</section>' % (cls, ' id="%s" data-title="%s"' % (sid, e(title)) if title else '', inner)


def answer(title, p1, p2=''):
    return '<div class="wrap ans"><div class="answer rv"><h2>%s</h2><div><p>%s</p>%s</div></div></div>' % (e(title), e(p1), '<p>%s</p>' % e(p2) if p2 else '')


def card(href, src, alt, tag, title, body, more='Explore'):
    t = 'a' if href else 'div'
    return '<%s class="card rv"%s><figure>%s</figure><div class="cb"><span class="tag">%s</span><h3>%s</h3><p>%s</p>%s</div></%s>' % (
        t, ' href="%s"' % href if href else '', img(src, alt), e(tag), e(title), e(body), '<span class="more">%s%s</span>' % (e(more), ARROW) if href else '', t)


def flat(no, title, body):
    return '<div class="card flat rv"><span class="no">%s</span><h3>%s</h3><p>%s</p></div>' % (e(no), e(title), e(body))


def grid(cls, items): return '<div class="grid %s stagger">%s</div>' % (cls, ''.join(items))


def ticks(items): return '<ul class="ticks">' + ''.join('<li><span>%s</span></li>' % t for t in items) + '</ul>'


def split(src, alt, eyebrow, h2, paras, tk=None, rev=False, links=None):
    body = '<p class="eyebrow">%s</p><h2 class="h2">%s</h2><div class="prose" style="margin-top:20px">%s</div>' % (e(eyebrow), h2, ''.join('<p>%s</p>' % e(x) for x in paras))
    if tk: body += ticks(tk)
    if links: body += btns(links)
    return '<div class="split%s"><div class="rv">%s</div><figure class="rv-clip">%s</figure></div>' % (' rev' if rev else '', body, img(src, alt))


def marquee(words, cls=''):
    t = ''.join('<span>%s</span><i>✦</i>' % e(w) for w in words)
    return '<div class="mq %s" aria-hidden="true"><div class="mq-tr">%s%s</div></div>' % (cls, t, t)


def rail(items, note=''):
    cards = ''
    for i, (href, src, alt, tag, title, body) in enumerate(items):
        t = 'a' if href else 'div'
        cards += '<%s class="rc"%s><figure>%s</figure><i class="rc-n">%02d</i><div class="rc-b"><span class="tag">%s</span><h3>%s</h3><p>%s</p></div></%s>' % (
            t, ' href="%s"' % href if href else '', img(src, alt), i + 1, e(tag), e(title), e(body), t)
    return ('<div class="rail2 rv"><div class="rail2-ar"><button type="button" data-d="-1" aria-label="Previous">%s</button><button type="button" data-d="1" aria-label="Next">%s</button></div>'
            '<div class="rail2-vp"><div class="rail2-tr">%s</div></div></div>%s') % (ARROW, ARROW, cards, '<p class="note wrap">%s</p>' % e(note) if note else '')


def rows(items):
    """items: (title, body, src, alt, href|None) - hover a row to preview its photo."""
    li = ''.join('<li class="rw%s" data-i="%d"><%s%s><span class="rn">%02d</span><div><h3>%s</h3><p>%s</p></div><span class="ra">%s</span></%s><img class="rw-img" src="%s" alt="%s" loading="lazy"></li>' % (
        ' on' if i == 0 else '', i, 'a' if h else 'div', ' href="%s"' % h if h else '', i + 1, e(t), e(b), ARROW, 'a' if h else 'div', s, e(a)) for i, (t, b, s, a, h) in enumerate(items))
    pv = ''.join('<figure data-i="%d"%s>%s</figure>' % (i, ' class="on"' if i == 0 else '', img(s, a)) for i, (t, b, s, a, h) in enumerate(items))
    return '<div class="rows"><ol class="rows-l rv">%s</ol><div class="rows-pv rv-clip" aria-hidden="true">%s</div></div>' % (li, pv)


def bento(tiles):
    out = ''
    for t in tiles:
        k = t[0]
        if k == 'img':
            out += '<figure class="bt bt-i %s rv-clip">%s<figcaption><b>%s</b><span>%s</span></figcaption></figure>' % (t[5], img(t[1], t[2]), e(t[3]), e(t[4]))
        elif k == 'stat':
            out += '<div class="bt bt-s %s rv"><b>%s</b><span>%s</span></div>' % (t[3], cnum(t[1]), e(t[2]))
        else:
            out += '<div class="bt bt-t %s rv"><span class="no">%s</span><h3>%s</h3><p>%s</p></div>' % (t[4], e(t[1]), e(t[2]), e(t[3]))
    return '<div class="bento">%s</div>' % out


def sticky(blocks):
    """blocks: (src, alt, title, body, ticks|None) - the photo changes as each step scrolls past."""
    ims = ''.join('<img src="%s" alt="%s" data-i="%d"%s loading="lazy">' % (s, e(a), i, ' class="on"' if i == 0 else '') for i, (s, a, t, b, k) in enumerate(blocks))
    art = ''.join('<article class="sb%s" data-i="%d"><img class="sb-mi" src="%s" alt="%s" loading="lazy"><span class="no">%02d</span><h3>%s</h3><p>%s</p>%s</article>' % (
        ' on' if i == 0 else '', i, s, e(a), i + 1, e(t), e(b), ticks(k) if k else '') for i, (s, a, t, b, k) in enumerate(blocks))
    return '<div class="stky"><div class="stky-img"><div class="stky-fr rv-clip">%s</div></div><div class="stky-tx">%s</div></div>' % (ims, art)


def tlv(items):
    li = ''.join('<li class="tv"><span class="tv-d">%s</span><div class="rv"><h3>%s</h3><p>%s</p></div></li>' % (e(a), e(b), e(c)) for a, b, c in items)
    return '<ol class="tlv">%s</ol>' % li


def statband(items, cls=''):
    return '<section class="band %s"><div class="wrap"><ul>%s</ul></div></section>' % (cls, ''.join('<li class="rv"><b>%s</b><span>%s</span></li>' % (cnum(a), e(b)) for a, b in items))


def pxb(src, alt, h, sub=''):
    return '<section class="pxb">%s<div class="pxb-s"></div><div class="wrap rv"><h2>%s</h2>%s</div></section>' % (img(src, alt, par=True), h, '<p>%s</p>' % e(sub) if sub else '')


def compare(items):
    r = ''.join('<div class="cmp-r rv"><b>%s</b><p class="x">%s</p><p class="y">%s</p></div>' % (e(t), e(x), e(y)) for t, x, y in items)
    return '<div class="cmp"><div class="cmp-h"><span>The check</span><span>What can go wrong</span><span>The Homworks standard</span></div>%s</div>' % r


def citytiles(cities):
    out = []
    for i, c in enumerate(cities):
        maps = 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(c['address'])
        out.append('<a class="ct c%d rv" id="%s" href="%s" target="_blank" rel="noopener" aria-label="Open the Homworks %s centre in Google Maps">%s<span class="ct-t">%s</span><span class="ct-n">%s</span>'
                   '<span class="ct-a">%s</span><span class="ct-d"><span><b>Address</b>%s</span><span><b>Phone</b>%s</span><span><b>Email</b>%s</span><span class="ct-go">Open in Google Maps →</span></span><i>%s</i></a>' % (
            i % 4, c['slug'], maps, e(c['name']), img(ST(LM[c['slug']][0]), LM[c['slug']][1], cls='ct-bg'), e(c['tag']), e(c['name']), e(c['addrShort']), e(c['address']), PHONE, EMAIL, ARROW))
    return '<div class="cts stagger">%s</div>' % ''.join(out)


def steps3():
    data = [('GET', ['Meet your designer', 'Requirement gathering', 'Initial design', 'Booking advance', 'Site measurement']),
            ('SET', ['3D model + Quality check', 'Design freeze', 'BOM + Production drawings', 'Site validation', 'Final sign-off']),
            ('GO', ['Execution begins', 'Factory production', 'Site readiness', 'Dispatch & delivery', 'Installation, QC, Handover'])]
    return '<div class="stepsx stagger">' + ''.join('<div class="stp rv"><span class="no">0%d</span><h3>%s</h3><ul>%s</ul></div>' % (i + 1, w, ''.join('<li>%s</li>' % e(x) for x in it)) for i, (w, it) in enumerate(data)) + '</div>'


def faq_block(title, eyebrow, qas, groups=None):
    rows_ = lambda items: ''.join('<div class="qa"><button type="button" aria-expanded="false">%s<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="a"><p>%s</p></div></div>' % (e(q), e(a)) for q, a in items)
    lst = ''.join('<div class="faqg" id="%s"><h3>%s</h3>%s</div>' % (slug(g), e(g), rows_(it)) for g, it in groups) if groups else rows_(qas)
    return '<div class="faqw"><div class="rv"><p class="eyebrow">%s</p><h2 class="h2">%s</h2></div><div class="rv d1">%s</div></div>' % (e(eyebrow), title, lst)


def recap(heading='The whole page, <em>at a glance.</em>'):
    items = [c for c in CUR if c[0]]
    if not items:
        return ''
    pat = {1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [3, 2], 6: [3, 3], 7: [4, 3], 8: [4, 4]}.get(len(items), [3] * ((len(items) + 2) // 3))
    spans = [12 // k for k in pat for _ in range(k)]
    cells = ''.join('<a class="rcp rv" style="grid-column:span %d" href="#%s"><span class="rcp-n">%02d</span><b>%s</b><span>%s</span><i>%s</i></a>' % (spans[i], sid, i + 1, e(t), e(s_), ARROW) for i, (t, sid, s_) in enumerate(items))
    return '<section class="sec recap" id="recap" data-title="Recap"><div class="wrap">%s<div class="rcps stagger">%s</div></div></section>' % (sh('In short', heading, 'Everything you have just read, in one place. Tap any card to jump back to it.'), cells)


def cta(h2, p, primary=('Book a FREE consultation', 'contact.html'), second=('Call %s' % PHONE, 'tel:' + PHONE_TEL)):
    return '<section class="cta3"><div class="wrap"><div class="rv"><h2>%s</h2><p>%s</p></div><div class="btns rv d1"><a class="btn pink" href="%s">%s%s</a><a class="btn line" href="%s">%s</a></div></div></section>' % (
        h2, e(p), primary[1], e(primary[0]), ARROW, second[1], e(second[0]))


def gd_qas(): return [(g[6].strip('“”"'), 'The Homworks standard: ' + g[5]) for g in GD]


FAQ = {
    'cost': ('How much do Homworks interiors cost?', 'The cost depends on your home size, finish and the rooms you choose. After your free consultation, your designer confirms a fixed quote, and Homworks prices module by module so the quotation is as close as possible to the final cost.'),
    'time': ('How long does a Homworks project take?', 'Homworks aims to finish your interiors in just 30 working days from design sign-off, or it’s free*. The clock starts when you approve your 3D design and fixed quote. The guarantee excludes client-side delays, design changes and site readiness, and adds 10 days for North East India and out-of-inventory finishes.'),
    'factory': ('Are Homworks interiors made in-house?', 'Yes. Furniture is made in the Homworks factory in Coimbatore, using CNC and flat-lamination machinery imported from Italy and Germany, and then fitted at your home. Site carpentry is kept for fillers, end panels and visible panels.'),
    'warranty': ('What warranty does Homworks give?', 'Every Homworks project carries a 10-year warranty on cabinetry, carcass and mechanisms. Ask your designer for the written terms before you sign off.'),
    'cities': ('Which cities does Homworks serve?', 'Homworks has centres in Coimbatore, Chennai, Bangalore, Erode, Hyderabad and Guwahati.'),
    'changes': ('Can I make changes after design sign-off?', 'Minor changes are usually possible before production begins. Larger changes once production has started can affect your timeline and cost, and the 30-day guarantee excludes design changes.'),
    'start': ('How do I start a Homworks project?', 'Book a free consultation. A Homworks designer calls you within 24 hours to understand your home, and you can consult by video call or visit an experience centre.'),
    'board': ('What boards does Homworks use for cabinets?', 'Homworks uses ISI-certified BWP / HDHMR E0 double-side post-laminated boards as the core material in every carcass. E0-grade boards carry no formaldehyde.'),
    'wet': ('Are Homworks kitchens built for heat and moisture?', 'Yes. Every BWP-grade plywood is tested in boiling water for 72 hours, edges are banded with PUR hot-melt glue that withstands up to 80° C, and an 18mm gap is kept between the wall and the carcass so the core stays away from wall dampness.'),
    'finish': ('What finishes does Homworks offer?', 'Homworks offers lamination, membrane, acrylic and PU paint finishes, in a wide range of designs, colours and finishing options for every room.'),
    'sawdust': ('Where are the furniture parts manufactured?', 'Your furniture parts are made in our factory and brought to your home for fitting. Cutting and fabrication happen off-site rather than turning your home into a carpentry workshop.'),
    'dust': ('Will any carpentry work still happen in my home?', 'Most fabrication happens in the factory. Installation may still involve drilling, fixing hardware, and small fitting adjustments. This reduces on-site carpentry, but does not mean installation will be completely dust- or noise-free.'),
}
F = lambda *k: [FAQ[x] for x in k]
FAQ_FULL = {'sawdust': FAQ['sawdust'],
            'whyoff': ('Why do you avoid on-site carpentry?', 'Factory fabrication reduces the cutting, sanding, dust, and noise at your property. Your home becomes the installation site, not the workshop. Some drilling and final adjustments may still be needed during fitting.'),
            'install': ('What happens during the installation phase?', 'The factory-made parts are delivered to your property for assembly, positioning, leveling, and securing. The focus is on fitting the furniture into your space rather than building it from raw materials on-site.'),
            'custom': ('Can factory-made furniture be customised for my space?', 'Factory-made does not have to mean standard-sized. Furniture can be designed around your room dimensions, storage needs, and chosen finishes, with the design and measurements confirmed before production.'),
            'dust': FAQ['dust']}
PAGES = {}
HOME = ('Home', 'index.html')


def add(slug_, title, desc, body, active='', faq=None, extra_ld=None, crumbs=None, og='assets/stock/kit-warm.webp', typ='WebPage'):
    PAGES[slug_] = dict(title=title, desc=desc, body=body, active=active, faq=faq, extra=extra_ld or [], crumbs=crumbs or [], og=og, typ=typ)
    BUILT.add(slug_ + '.html')


UNITS = [('Console unit', P[1]['cards'][0][3], 'entry-1', 'A console unit by Homworks'), ('Living partition', P[1]['cards'][1][3], 'living-tv', 'A living room partition with a TV wall'),
         ('Wall panel', P[1]['cards'][2][3], 'living-2', 'A wall panel behind a TV'), ('TV unit · floor-standing', P[1]['cards'][3][3], 'living-3', 'A floor-standing TV unit'),
         ('TV unit · wall-hung', P[1]['cards'][4][3], 'living-2', 'A wall-hung TV unit')]

# ------------------------------------------------------------------ INTERIORS HUB
body = hero_split([HOME, ('Interiors', None)], 'Interiors', 'When rooms <em>become masterpieces…</em>',
                  'Kitchens, bedrooms, wardrobes, living rooms, kids’ rooms - we turn blueprints into beautiful spaces.',
                  [('Book a FREE consultation', 'contact.html', 'solid'), ('See how it works', 'how-it-works.html', 'line')],
                  [('30', 'days from design sign-off*'), ('10 years', 'warranty'), ('6', 'kitchen layouts')],
                  ST('kit-warm'), 'A warm wooden island kitchen', pill='Every room, one team',
                  glass=('One team, start to handover', ['Design and 3D plan', 'Made in our own factory', 'Fitted by our installation team']))
body += answer('What Homworks designs', 'Homworks designs, manufactures and installs full home interiors, modular kitchens, living room units, bedrooms, cots and wardrobes.',
               'Every project has one team accountable from the first design to final handover, a 30-day delivery promise* and a 10-year warranty.')
body += marquee(['Kitchens', 'Bedrooms', 'Wardrobes', 'Living rooms', 'Kids’ rooms'])
rooms = [('full-home-interiors.html', ST('living-2'), 'A finished living and dining room', 'Whole home', 'Full Home Interiors', 'A cohesive plan for every space, with one team accountable from the first design to final handover.'),
         ('modular-kitchens.html', ST('kit-island'), 'A modular kitchen with an island', 'Kitchen', 'Modular Kitchens', 'Pick from 6 layouts in 6 styles, shaped around people who use it.'),
         ('living-rooms.html', ST('living-tv'), 'A living room TV wall with a partition', 'Living', 'Living Rooms', 'Console units, partitions, wall panels and TV units – let custom cabinets become style statements.'),
         ('bedrooms.html', ST('bed-1'), 'A bedroom with a wooden headboard', 'Bedroom', 'Bedrooms', 'Made from quality materials, our cots are the foundation for your dreams – styled to suit your interior.'),
         ('wardrobes.html', ST('ward-1'), 'A walk-in wardrobe', 'Storage', 'Wardrobes', 'From the L-shaped corner wardrobe to the walk-in, built to use every inch.'),
         ('modular-kitchens.html#layouts', ST('kit-l'), 'An L-shaped modular kitchen', 'Layouts', 'Six kitchen layouts', 'L-shaped, U-shaped, galley, one-wall, peninsular and island kitchens.')]
body += section(sh('Rooms', 'Find the space that <em>fits your life.</em>', 'Each room is designed around how your family lives, then made in our own factory and installed by our own team.') + grid('g3', [card(*r) for r in rooms]),
                '', 'Rooms', 'Six places to start, from the whole home to a single wardrobe.')
body += full('<div class="wrap">%s</div>%s' % (sh('Units & styles', 'Cabinets that become <em>style statements.</em>', 'Swipe through the units our designers are asked for most.'), rail([
    (None, ST('living-tv'), 'Living room partition and TV wall', 'Living', 'Living partition', UNITS[1][1]),
    (None, ST('living-2'), 'A wall-hung TV unit', 'Living', 'TV unit', 'Floor-standing or wall-hung; floating cabinets leave the floor clear.'),
    (None, ST('entry-1'), 'A console unit in a hallway', 'Living', 'Console unit', UNITS[0][1]),
    (None, ST('ward-2'), 'A walk-in wardrobe with open shelves', 'Wardrobe', 'Walk-in wardrobe', 'The dream wardrobe and an epitome of luxury.'),
    (None, ST('ward-3'), 'An L-shaped wardrobe corner', 'Wardrobe', 'L-shaped wardrobe', 'For those who want to use every bedroom corner.'),
    (None, ST('bed-3'), 'A bedroom with a cot and headboard', 'Bedroom', 'Cots', 'Hydraulic, storage and fabric-headboard cots.'),
    (None, ST('kids-1'), 'A kids’ room with a bunk bed', 'Kids’ room', 'Bunk bed with steps', 'A bunk bed with a built-in staircase.')], 'Images are illustrative stock photography.')),
    'units', 'Units & styles', 'Console, partition, wall panel, TV, wardrobe, cot and bunk-bed units.')
body += pxb(ST('kit-modern'), 'A modern kitchen with pendant lights', 'A spectrum of <em>texture &amp; colour.</em>', 'Lamination, membrane, acrylic and PU paint, in a wide range of designs, colours and finishes.')
body += section(sh('Finishes', 'Four finishes, <em>every room.</em>') + bento([
    ('img', 'assets/home5/fan-lamination.webp', 'Lamination finish sample', 'Lamination', FIN[0][1][0][1], 'w2 h2'),
    ('img', 'assets/home5/fan-membrane.webp', 'Membrane finish sample', 'Membrane', FIN[1][1][0][1], ''),
    ('img', 'assets/home5/fan-acrylic.webp', 'Acrylic finish sample', 'Acrylic', FIN[2][1][0][1], ''),
    ('img', 'assets/home5/fan-pu.webp', 'PU paint finish sample', 'PU paint', FIN[3][1][0][1], 'w2')]), 'alt', 'Finishes', 'Lamination, membrane, acrylic and PU paint.')
body += section(faq_block('Before you <em>start</em>', 'Questions', F('cost', 'time', 'finish', 'start')), '', 'Questions', 'Cost, timeline, finishes and how to begin.')
body += recap() + cta('Not sure where <em>to start?</em>', 'Call for a free design – a Homworks designer calls you within 24 hours.')
add('interiors', 'Interior Design for Every Room | Homworks', 'Homworks designs, makes and installs kitchens, bedrooms, wardrobes and living rooms in 30 days from sign-off, with a 10-year warranty.',
    body, 'interiors.html', F('cost', 'time', 'finish', 'start'), crumbs=[HOME, ('Interiors', 'interiors.html')], og=ST('kit-warm'))

# ------------------------------------------------------------------ FULL HOME
body = hero_full([HOME, ('Interiors', 'interiors.html'), ('Full Home Interiors', None)], 'Full home interiors', 'Custom designs <em>for each room</em>',
                 'A cohesive plan for every space, with one team accountable from the first design to final handover.',
                 [('Call for a FREE design', 'contact.html', 'pink'), ('The Homworks process', 'how-it-works.html', 'line')],
                 [('1', 'accountable team'), ('30', 'days from sign-off*'), ('10 years', 'warranty'), ('15', 'clear steps')], ST('living-2'), 'A finished living and dining room')
body += answer('Full home interiors at Homworks', 'Homworks plans, manufactures and installs interiors for every room of your home as one project, with one team accountable from the first design to final handover.',
               'Your 3D design and fixed quote are approved once, the clock starts at sign-off, and your 10-year warranty begins at handover.')
body += section(sh('One plan', 'Get. Set. <em>Go.</em>', 'A clear step-by-step path to a beautifully designed home.') + sticky([
    (ST('plan-1'), 'A couple reviewing a floor plan together', 'GET', 'Talk to a designer and get personalised designs and a quote for your dream home.', ['Meet your designer', 'Requirement gathering', 'Initial design', 'Booking advance', 'Site measurement']),
    (ST('samples'), 'Finish samples laid out on a table', 'SET', 'Your 3D model is checked, frozen and turned into production drawings.', ['3D model + Quality check', 'Design freeze', 'BOM + Production drawings', 'Site validation', 'Final sign-off']),
    (ST('inst-1'), 'A fitted kitchen being finished on site', 'GO', 'Production, delivery and installation, with a quality check before handover.', ['Execution begins', 'Factory production', 'Site readiness', 'Dispatch & delivery', 'Installation, QC, Handover'])]),
    '', 'One plan', 'Get, Set and Go: fifteen steps from first meeting to handover.')
body += section(sh('Room by room', 'Start with the room <em>that matters most.</em>') + rows([
    ('Modular kitchen', P[2]['p'], ST('kit-island'), 'A modular kitchen with an island', 'modular-kitchens.html'),
    ('Living room', P[1]['p'], ST('living-tv'), 'A living room TV wall', 'living-rooms.html'),
    ('Bedroom', P[3]['p'], ST('bed-1'), 'A bedroom with a wooden headboard', 'bedrooms.html'),
    ('Wardrobes', 'L-shaped corner wardrobes and walk-ins, built to use every inch.', ST('ward-2'), 'A walk-in wardrobe', 'wardrobes.html'),
    ('Kids’ rooms', P[3]['cards'][5][3], ST('kids-1'), 'A kids’ room with a bunk bed', 'bedrooms.html')]), 'alt', 'Room by room', 'Kitchen, living room, bedroom, wardrobes and kids’ rooms.')
body += section(sh('And more', 'Rooms made <em>to measure.</em>', 'A cohesive plan covers the rest of the home too.') + bento([('text', '%02d' % (i + 1), c[2], c[3], 'w2') for i, c in enumerate(P[0]['cards'])]), '', 'And more', 'Home office, pooja room, dining and vanity.')
body += statband([('1', 'accountable team from first design to handover'), ('30', 'days from design sign-off*'), ('10 years', 'warranty on every project'), ('15', 'steps, laid out plainly')])
body += section(faq_block('Full home <em>questions</em>', 'Questions', F('time', 'cost', 'changes', 'factory')), '', 'Questions', 'Timeline, cost, changes and the factory.')
body += recap() + cta('Make your whole home <em>work beautifully.</em>', 'Call for a free design and meet a designer within 24 hours.')
add('full-home-interiors', 'Full Home Interior Design & Installation | Homworks', 'Full home interiors by Homworks: one team from design to handover, made in our own factory, 30 days from sign-off*, 10-year warranty.',
    body, 'interiors.html', F('time', 'cost', 'changes', 'factory'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Full Home Interiors', 'full-home-interiors.html')], og=ST('living-2'), typ='Service')

# ------------------------------------------------------------------ MODULAR KITCHENS
STYLES = ['Indian Classic', 'Contemporary', 'Indian Traditional', 'Minimalistic', 'Modern', 'English Classic']
body = hero_collage([HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', None)], 'Modular kitchens', 'The kitchen <em>of your dreams</em>',
                    'Beyond just a place to cook, a space where families gather. Pick from 6 layouts in 6 styles, shaped around people who use it.',
                    [('Call for a FREE design', 'contact.html', 'solid'), ('Explore the 6 layouts', '#layouts', 'line')],
                    [('6', 'layouts'), ('6', 'styles'), ('10 years', 'warranty')],
                    [(ST('kit-island'), 'An island modular kitchen'), (ST('kit-l'), 'An L-shaped modular kitchen'), (ST('cook-2'), 'A woman making flatbread in a modern kitchen')], pill='6 layouts · 6 styles')
body += answer('Modular kitchens at Homworks', 'Homworks makes modular kitchens in six layouts – L-shaped, U-shaped, galley, one-wall, peninsular and island – and six styles, designed around your floor plan and made in its own factory.',
               'Kitchen carcasses use ISI-certified BWP / HDHMR E0 boards, and every project carries a 10-year warranty.')
body += full('<div class="wrap">%s</div>%s' % (sh('Choose a layout', 'Six layouts. <em>One right answer</em> for your home.', 'Each layout suits a different home size and way of cooking.'),
             rail([('kitchen-%s.html' % l['slug'], ST(KSTOCK[l['slug']]), '%s modular kitchen' % l['name'], 'Best for ' + l['bestFor'], l['name'] + ' kitchen', l['blurb']) for l in KL], 'Images are illustrative stock photography.')),
             '', 'Layouts', 'L-shaped, U-shaped, galley, one-wall, peninsular and island.')
body = body.replace('<section class="sec " id="layouts"', '<section class="sec " id="layouts"')
body += marquee(STYLES, 'big')
body += section(sh('Styles', 'Six styles, <em>shaped around you.</em>') + '<ul class="chips rv">' + ''.join('<li>%s</li>' % s for s in STYLES) + '</ul>', 'tight', 'Styles', 'Indian Classic to English Classic.')
body += section(sh('Built for a working kitchen', 'Heat, steam and <em>years of daily use.</em>', 'Kitchens are damp, hot and wet places. Homworks tests, bonds and spaces every kitchen with that in mind.') + sticky([
    (ST('cnc-1'), 'A CNC machine cutting boards', '72-hour boiling test', 'Every BWP-grade plywood is tested in boiling water for 72 hours, with results recorded before it is used in projects.', None),
    (ST('samples'), 'Edge-band and finish samples', 'PUR hot-melt edge-banding', 'Ideal for high-temperature environments like kitchens, withstanding up to 80° C. Edge strength is above 7 Newtons.', None),
    (ST('inst-2'), 'A cabinet door being fitted', '18mm gap from the wall', 'The 18mm gap keeps the core materials away from wall dampness, so the product lasts longer.', None),
    (ST('kit-warm'), 'A warm kitchen with a wooden island', 'Double carcass', 'A single unit can be replaced easily without disturbing the other cabinets.', None)]),
    'alt', 'Built for the kitchen', 'Boiling test, PUR edges, an 18mm gap and a double carcass.')
body += section(faq_block('Modular kitchen <em>questions</em>', 'Questions', F('wet', 'board', 'time', 'cost')), '', 'Questions', 'Heat, boards, timeline and cost.')
body += recap() + cta('Let’s plan your <em>perfect kitchen.</em>', 'Call for a free design and meet a kitchen designer within 24 hours.')
add('modular-kitchens', 'Modular Kitchen Designs in 6 Layouts & 6 Styles | Homworks', 'Modular kitchens by Homworks: L-shaped, U-shaped, galley, one-wall, peninsular and island layouts, made in our factory with a 10-year warranty.',
    body, 'interiors.html', F('wet', 'board', 'time', 'cost'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', 'modular-kitchens.html')], og=ST('kit-island'), typ='Service')

# ------------------------------------------------------------------ KITCHEN LAYOUTS (x6)
for l in KL:
    s = l['slug']; others = [o for o in KL if o['slug'] != s]
    pr = l['h1'].split('<br>'); h1 = pr[0] + ' <em>' + pr[1] + '</em>'
    art = 'an' if l['name'][0] in 'AEIOU' else 'a'
    qas = [('Who is the %s kitchen best for?' % l['name'], 'Homworks recommends the %s kitchen for %s, typically in a footprint of %s. %s' % (l['name'], l['bestFor'], l['footprint'], l['blurb'])),
           ('What are the benefits of %s %s kitchen?' % (art, l['name']), ' '.join('%s. %s' % (p['t'], p['b']) for p in l['pros'])), FAQ['board'], FAQ['time']]
    body = hero_full([HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', 'modular-kitchens.html'), (l['name'], None)], 'Modular kitchens / ' + l['name'], h1, l['blurb'],
                     [('Call for a FREE design', 'contact.html', 'pink'), ('All kitchen layouts', 'modular-kitchens.html#layouts', 'line')],
                     [(l['footprint'], 'typical footprint'), (l['bestFor'], 'best for'), ('6', 'styles to choose from'), ('10 years', 'warranty')], ST(KSTOCK[s]), '%s modular kitchen' % l['name'])
    body += answer('%s kitchen at a glance' % l['name'], '%s It suits %s, in a typical footprint of %s.' % (l['blurb'], l['bestFor'], l['footprint']))
    body += section(sh('Why this layout', 'What the %s layout <em>gives you.</em>' % l['name']) + bento([
        ('img', ST(KSTOCK[s]), '%s modular kitchen' % l['name'], l['name'] + ' kitchen', 'Best for ' + l['bestFor'], 'w2 h2'),
        ('text', '01', l['pros'][0]['t'], l['pros'][0]['b'], ''), ('text', '02', l['pros'][1]['t'], l['pros'][1]['b'], ''),
        ('stat', l['footprint'], 'a typical footprint for this layout', 'dark'), ('text', '03', l['pros'][2]['t'], l['pros'][2]['b'], ''),
        ('text', '04', l['pros'][3]['t'], l['pros'][3]['b'], 'w2')]), '', 'Why this layout', 'Four advantages of the %s layout.' % l['name'])
    body += section(split(ST('cnc-1'), 'A CNC machine cutting a kitchen board', 'Made to last', 'Engineered for <em>daily cooking.</em>',
                          ['Your %s kitchen is made in the Homworks factory in Coimbatore and fitted at your home.' % l['name'].lower()],
                          ['ISI-certified BWP / HDHMR E0 boards in every carcass', 'PUR hot-melt edge-banding, up to 80° C', 'An 18mm gap between wall and carcass', 'A 10-year warranty'], rev=True),
                    'alt', 'Made to last', 'Certified boards, PUR edges, an 18mm gap and a 10-year warranty.')
    body += full('<div class="wrap">%s</div>%s' % (sh('More layouts', 'Compare the <em>other five.</em>'), rail([('kitchen-%s.html' % o['slug'], ST(KSTOCK[o['slug']]), '%s modular kitchen' % o['name'], 'Best for ' + o['bestFor'], o['name'] + ' kitchen', o['blurb']) for o in others])),
                 '', 'Other layouts', 'The five other Homworks kitchen layouts.')
    body += section(faq_block('%s kitchen <em>questions</em>' % l['name'], 'Questions', qas), 'alt', 'Questions', 'Who it suits, benefits, boards and timeline.')
    body += recap() + cta('Planning %s %s kitchen?' % (art, l['name']), 'Call for a free design and meet a kitchen designer within 24 hours.')
    add('kitchen-' + s, '%s Modular Kitchen Design | Homworks' % l['name'], '%s modular kitchen by Homworks: best for %s, %s footprint, made in our own factory with a 10-year warranty.' % (l['name'], l['bestFor'], l['footprint']),
        body, 'interiors.html', qas, crumbs=[HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', 'modular-kitchens.html'), (l['name'], 'kitchen-%s.html' % s)], og=ST(KSTOCK[s]), typ='Service')

# ------------------------------------------------------------------ LIVING ROOMS
body = hero_full([HOME, ('Interiors', 'interiors.html'), ('Living Rooms', None)], 'Living rooms', 'Enhancing your <em>entertainment space.</em>',
                 'Console units, partitions, wall panels and TV units - let custom cabinets become style statements.',
                 [('Call for a FREE design', 'contact.html', 'pink'), ('See all rooms', 'interiors.html', 'line')],
                 [('5', 'living unit styles'), ('30', 'days from sign-off*'), ('10 years', 'warranty')], ST('living-tv'), 'A living room with a partition and TV wall')
body += answer('Living room interiors at Homworks', 'Homworks makes console units, living partitions, wall panels and TV units – floor-standing or wall-hung – as custom cabinets designed around your room.',
               'Cabinets are the most underrated, trend-making part of a living room.')
body += section(sh('The living room range', 'Hover a unit. <em>See the style.</em>') + rows([(u[0], u[1], ST(u[2]), u[3], None) for u in UNITS]) + '<p class="note">Images are illustrative stock photography.</p>',
                '', 'The range', 'Console, partition, wall panel and two kinds of TV unit.')
body += marquee(['Console', 'Partition', 'Wall panel', 'TV unit'], 'big')
body += pxb(ST('living-2'), 'A modern living room with a wall-hung TV', 'Let custom cabinets <em>become style statements.</em>')
body += section(split(ST('living-3'), 'A floor-standing TV unit with shelves', 'TV units', 'Floor-standing <em>or wall-hung.</em>',
                      [UNITS[3][1], UNITS[4][1]], ['<b>Floor-standing</b> – low cabinets on a baseboard, for a contemporary look.', '<b>Wall-hung</b> – floating cabinets that leave the floor clear; a plinth can be added.']),
                'alt', 'TV units', 'Floor-standing on a baseboard, or wall-hung with a plinth.')
body += section(faq_block('Living room <em>questions</em>', 'Questions', F('finish', 'factory', 'time', 'cost')), '', 'Questions', 'Finishes, the factory, timeline and cost.')
body += recap() + cta('Give your living room <em>its statement.</em>', 'Call for a free design and meet a designer within 24 hours.')
add('living-rooms', 'Living Room & TV Unit Designs | Homworks', 'Console units, living partitions, wall panels and TV units by Homworks – custom cabinets made in our factory, with a 10-year warranty.',
    body, 'interiors.html', F('finish', 'factory', 'time', 'cost'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Living Rooms', 'living-rooms.html')], og=ST('living-tv'), typ='Service')

# ------------------------------------------------------------------ BEDROOMS
BED = P[3]['cards']
body = hero_collage([HOME, ('Interiors', 'interiors.html'), ('Bedrooms', None)], 'Bedrooms', 'Cots crafted <em>for comfort</em>',
                    'Made from quality materials, our cots are the foundation for your dreams – styled to suit your interior.',
                    [('Call for a FREE design', 'contact.html', 'solid'), ('Wardrobes', 'wardrobes.html', 'line')],
                    [('6', 'cot, wardrobe and kids’ designs'), ('30', 'days from sign-off*'), ('10 years', 'warranty')],
                    [(ST('bed-1'), 'A bedroom with a wooden headboard'), (ST('bed-2'), 'A bed with a patterned headboard'), (ST('kids-1'), 'A kids’ room with a bunk bed')], pill='Cots · Wardrobes · Kids’ rooms')
body += answer('Bedroom interiors at Homworks', 'Homworks makes cots, headboards, wardrobes and kids’ room furniture in its own factory, styled to suit your interior.',
               'Choose a hydraulic cot, a cot with built-in storage, a fabric headboard, or a bunk bed with a built-in staircase.')
body += full('<div class="wrap">%s</div>%s' % (sh('The bedroom range', 'Rest, <em>made to measure.</em>', 'Swipe through cots, headboards, wardrobes and kids’ beds.'), rail([
    (None, ST('bed-3'), 'A bedroom with a cot and headboard', 'Cot', BED[0][2], BED[0][3]),
    (None, ST('bed-1'), 'A bed with a wooden headboard', 'Cot', BED[1][2], BED[1][3]),
    (None, ST('bed-2'), 'A bed with a fabric headboard', 'Headboard', BED[2][2], BED[2][3]),
    ('wardrobes.html', ST('ward-3'), 'An L-shaped wardrobe', 'Wardrobe', BED[3][2], BED[3][3]),
    ('wardrobes.html', ST('ward-2'), 'A walk-in wardrobe', 'Wardrobe', BED[4][2], BED[4][3]),
    (None, ST('kids-2'), 'A kids’ bunk bed', 'Kids’ room', BED[5][2], BED[5][3])], 'Images are illustrative stock photography.')), '', 'The range', 'Hydraulic and storage cots, a fabric headboard, wardrobes and a bunk bed.')
body += section(split(ST('ward-1'), 'A walk-in wardrobe with wooden shelves', 'Wardrobes', 'Storage that <em>fits two lives.</em>',
                      ['From the L-shaped corner wardrobe to the walk-in, built to use every inch and made to the millimetre in our own factory.'],
                      ['L-shaped corner wardrobes', 'Walk-in wardrobes', 'E0-grade boards and a 10-year warranty'], links=[('Explore wardrobes', 'wardrobes.html', 'solid')], rev=True),
                '', 'Wardrobes', 'L-shaped and walk-in wardrobes.')
body += section(split(ST('kids-3'), 'A kids’ bedroom with soft furnishings', 'Kids’ rooms', 'A bunk bed with <em>steps built in.</em>',
                      [BED[5][3], 'Kids’ rooms are designed around the same factory standard and 10-year warranty as the rest of your home.'],
                      ['Made from quality materials', 'Styled to suit your interior', 'Covered by a 10-year warranty']), 'alt', 'Kids’ rooms', 'A bunk bed with a built-in staircase.')
body += section(faq_block('Bedroom <em>questions</em>', 'Questions', F('board', 'finish', 'warranty', 'time')), '', 'Questions', 'Boards, finishes, warranty and timeline.')
body += recap() + cta('Make room for <em>finer living.</em>', 'Beautiful homes begin with Homworks. Call for a free design.')
add('bedrooms', 'Bedroom Interiors, Cots & Kids’ Rooms | Homworks', 'Cots, headboards, wardrobes and kids’ rooms by Homworks – made from quality materials in our own factory, with a 10-year warranty.',
    body, 'interiors.html', F('board', 'finish', 'warranty', 'time'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Bedrooms', 'bedrooms.html')], og=ST('bed-1'), typ='Service')

# ------------------------------------------------------------------ WARDROBES
body = hero_full([HOME, ('Interiors', 'interiors.html'), ('Wardrobes', None)], 'Wardrobes', 'Storage that uses <em>every inch.</em>',
                 'From the L-shaped corner wardrobe to the walk-in, built to make the most of your bedroom.',
                 [('Call for a FREE design', 'contact.html', 'pink'), ('Bedrooms', 'bedrooms.html', 'line')],
                 [('2', 'signature wardrobe styles'), ('E0', 'grade boards'), ('10 years', 'warranty')], ST('ward-1'), 'A walk-in wardrobe with wooden shelves', dark=True)
body += answer('Wardrobes at Homworks', 'Homworks builds L-shaped corner wardrobes and walk-in wardrobes in its own factory, designed around your room dimensions and storage needs.',
               'Boards are E0 grade, and furniture is made to the millimetre so fitting is smooth.')
body += section(sh('Wardrobe styles', 'Two ways to <em>store more.</em>') + bento([
    ('img', ST('ward-2'), 'A walk-in wardrobe', BED[4][2], BED[4][3], 'w2 h2'), ('img', ST('ward-3'), 'An L-shaped wardrobe', BED[3][2], BED[3][3], 'w2'),
    ('stat', 'E0', 'grade core boards, with no formaldehyde', 'dark'), ('stat', '10 years', 'warranty on cabinetry, carcass and mechanisms', '')]), '', 'Styles', 'L-shaped and walk-in wardrobes.')
body += section(sh('Finishes', 'Choose the finish <em>you will live with.</em>') + rows([
    ('Lamination', FIN[0][1][0][1], 'assets/home5/fan-lamination.webp', 'Lamination finish sample', None),
    ('Membrane', FIN[1][1][0][1], 'assets/home5/fan-membrane.webp', 'Membrane finish sample', None),
    ('Acrylic', FIN[2][1][0][1], 'assets/home5/fan-acrylic.webp', 'Acrylic finish sample', None),
    ('PU paint', FIN[3][1][0][1], 'assets/home5/fan-pu.webp', 'PU paint finish sample', None)]), 'alt', 'Finishes', 'Lamination, membrane, acrylic and PU paint.')
body += section(faq_block('Wardrobe <em>questions</em>', 'Questions', F('board', 'finish', 'warranty', 'time')), '', 'Questions', 'Boards, finishes, warranty and timeline.')
body += recap() + cta('Design a wardrobe <em>that fits you.</em>', 'Call for a free design and meet a designer within 24 hours.')
add('wardrobes', 'Wardrobe Designs: L-Shaped & Walk-In | Homworks', 'L-shaped and walk-in wardrobes by Homworks, made from E0-grade boards in our own factory with a 10-year warranty.',
    body, 'interiors.html', F('board', 'finish', 'warranty', 'time'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Wardrobes', 'wardrobes.html')], og=ST('ward-1'), typ='Service')

# ------------------------------------------------------------------ WHY HOMWORKS
WHY = [('Certified quality raw material', 'Every material clears a stringent QC process, from sourcing right through to installation.'),
       ('Factory-made, fine finish', 'AI-supported design software and skilled workmanship for a flawless, factory-precise finish.'),
       ('Unlimited choice', 'A wide range of designs, colours and finishing options for every room in your home.'),
       ('10-year warranty, real after-sales', 'Every project is backed by our warranty and prompt after-sales service.'),
       ('Superior, strong material', 'Selected hardwood core and face veneers, chosen for wear and damage resistance.'),
       ('High screw-holding ability', 'High-density hardwood species give every joint exceptional holding strength.'),
       ('Fungus & termite resistant', 'Treated against fungus, borer and termite, for interiors that are built to last.'),
       ('Moisture resistant, precisely made', 'Moisture-resistant materials with precision-engineered dimensions – no room for error.')]
body = hero_full([HOME, ('Why Homworks', None)], 'Why Homworks', 'Every <em>detail</em> is checked, so you don’t have to',
                 'Surface inspection under calibrated light. Because, every single detail matters.',
                 [('Call for a FREE design', 'contact.html', 'pink'), ('The 16 key questions', '#the-16-questions', 'line')],
                 [('100+', 'point quality check'), ('30', 'days from sign-off*'), ('10 years', 'warranty'), ('16', 'questions to ask any designer')], ST('fac-1'), 'Workers operating woodworking machinery on a modern factory floor', dark=True)
body += answer('Why choose Homworks', 'Homworks checks every raw material before it reaches your home, pairs AI-driven design software with skilled workmanship, and builds in its own factory to a 10-year warranty.',
               'From premium hardwood selection to advanced moisture resistance, your home is built to outlast trends - and withstand the test of time.')
body += statband([('100+', 'point quality check before handover'), ('72 hrs', 'boiling-water test on BWP-grade plywood'), ('30', 'days from design sign-off*'), ('10 years', 'warranty on every project')], 'dark')
body += section(sh('What sets us apart', 'Built to outlast <em>trends.</em>', 'We subject every raw material to a rigorous quality control mandate before it reaches your home.') + bento([
    ('img', ST('qc-1'), 'Measuring a wooden board for a quality check', WHY[0][0], WHY[0][1], 'w2 h2'),
    ('text', '02', WHY[1][0], WHY[1][1], ''), ('text', '03', WHY[2][0], WHY[2][1], ''),
    ('text', '04', WHY[3][0], WHY[3][1], 'w2'), ('stat', '8', 'reasons homeowners trust the Homworks standard', 'dark'),
    ('text', '05', WHY[4][0], WHY[4][1], ''), ('text', '06', WHY[5][0], WHY[5][1], ''), ('text', '07', WHY[6][0], WHY[6][1], ''),
    ('text', '08', WHY[7][0], WHY[7][1], '')]), 'alt', 'What sets us apart', 'Eight reasons homeowners trust the standard.')
body += section(sh('The process', 'The seamless <em>Homworks process</em>', 'A clear step-by-step path to a beautifully designed home.') + steps3(), '', 'The process', 'Get, Set and Go.')
body += pxb(ST('fac-3'), 'A technician operating a machine on the factory floor', 'Leave the checking <em>to us.</em>', 'Every raw material meets a rigorous quality control mandate before it reaches your home.')
body += section(sh('The Interior Guide', '16 key questions <em>you need to ask.</em>', 'Your home’s quality and longevity will depend on the answers. Consider these points before you choose any interior designer – including us.') +
                '<div class="faqw one"><div class="rv">%s</div></div>' % ''.join(
                    '<div class="qa"><button type="button" aria-expanded="false">%02d. %s<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="a"><p>%s %s</p></div></div>' % (i + 1, e(g[1]), e(g[2]), e('The Homworks standard: ' + g[5])) for i, g in enumerate(GD)),
                'alt', 'The 16 questions', 'Board, moisture, air, edges, glue, hardware, finish, pricing and more.')
body = body.replace('<section class="sec alt" id="the-16-questions"', '<section class="sec alt" id="the-16-questions"')
body += recap() + cta('Quality you can see. <em>Care you can count on.</em>', 'Call for a free design and see how the Homworks process feels different.')
add('why-homworks', 'Why Choose Homworks | 100+ Quality Checks, 10-Year Warranty', 'Why homeowners choose Homworks: every material checked, an own factory, a 30-day delivery promise* and a 10-year warranty. Plus 16 questions to ask any designer.',
    body, 'why-homworks.html', gd_qas(), crumbs=[HOME, ('Why Homworks', 'why-homworks.html')], og=ST('fac-1'))

# ------------------------------------------------------------------ ABOUT
body = hero_collage([HOME, ('Why Homworks', 'why-homworks.html'), ('About Us', None)], 'About Homworks', 'Thoughtful home interiors, <em>crafted for India.</em>',
                    'Homworks (Stylcove Modulars Pvt Ltd) designs, manufactures and installs home interiors, engineered in our own Coimbatore factory and built for longevity.',
                    [('Call for a FREE design', 'contact.html', 'solid'), ('Find a centre', 'locations.html', 'line')],
                    [('6', 'cities'), ('1', 'own factory'), ('10 years', 'warranty')],
                    [(ST('fac-1'), 'Workers on a modern woodworking factory floor'), (ST('cnc-1'), 'An automated drilling and machining line'), (ST('fac-2'), 'An operator working at a CNC machine')], pill='Made in Coimbatore')
body += answer('Who is Homworks?', 'Homworks is a home interiors company that designs, manufactures and installs furniture and interiors for the way India lives now.',
               'Interiors are engineered in Homworks’ own Coimbatore factory and fitted at your home by the Homworks team. Homworks operates as Stylcove Modulars Pvt Ltd, with centres in six cities.')
body += section(sh('What we believe', 'Four things <em>we hold to.</em>') + grid('g2', [
    flat('01', 'Design-led, always', 'Every project starts with a conversation about how you live.'),
    flat('02', 'In-house, end to end', 'Design, manufacturing and installation under one accountable team.'),
    flat('03', 'Checked, so you don’t have to', 'Every raw material meets a rigorous quality control mandate before it reaches your home.'),
    flat('04', 'Built to last', 'A 10-year warranty and an after-sales service to stand behind the work.')]), '', 'What we believe', 'Design-led, in-house, checked and built to last.')
body += pxb(ST('cnc-1'), 'CNC machining in a workshop', 'Made in our own <em>Coimbatore factory.</em>', 'CNC and flat-lamination machinery imported from Italy and Germany.')
body += section(split(ST('fac-4'), 'Board stock being inspected in a materials warehouse', 'The factory', 'Each material is <em>tested twice.</em>',
                      ['When it reaches the factory, and when it is issued to a project. Our own manufacturing facility runs CNC and flat-lamination machinery imported from Italy and Germany.'],
                      ['An in-house material testing lab', 'Own installation team', 'Site carpentry kept for fillers, end panels and visible panels'], links=[('Quality & factory', 'quality-factory.html', 'line')]),
                'alt', 'The factory', 'Own factory, in-house testing lab and installation team.')
body += section(sh('Where we are', 'Six cities, <em>one standard.</em>') + citytiles(CITIES), '', 'Six cities', 'Coimbatore, Chennai, Bangalore, Erode, Hyderabad and Guwahati.')
body += recap() + cta('Come see <em>how we build.</em>', 'Call for a free design and meet a Homworks designer.')
add('about-us', 'About Homworks | Home Interiors Made in Coimbatore', 'Homworks (Stylcove Modulars Pvt Ltd) designs, manufactures and installs home interiors in its own Coimbatore factory, with centres in six cities.',
    body, 'about-us.html', None, crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('About Us', 'about-us.html')], og=ST('fac-1'), typ='AboutPage')

# ------------------------------------------------------------------ HOW IT WORKS
HOW = [('Get', ['Meet your designer', 'Requirement gathering', 'Initial design', 'Booking advance', 'Site measurement']),
       ('Set', ['3D model + Quality check', 'Design freeze', 'BOM + Production drawings', 'Site validation', 'Final sign-off']),
       ('Go', ['Execution begins', 'Factory production', 'Site readiness', 'Dispatch & delivery', 'Installation, QC, Handover'])]
body = hero_type([HOME, ('Why Homworks', 'why-homworks.html'), ('How It Works', None)], 'How it works', 'The seamless <em>Homworks process</em>', 'A clear step-by-step path to a beautifully designed home.',
                 [('Call for a FREE design', 'contact.html', 'pink'), ('The 30-day promise', '30-day-delivery.html', 'line')],
                 extra='<div class="gsg" aria-hidden="true"><span>GET</span><span>SET</span><span>GO</span></div>', dark=True)
body += answer('How does Homworks work?', 'Homworks works in three stages – Get, Set and Go – covering 15 steps from meeting your designer to installation, quality check and handover.',
               'Consult by video call or visit an experience centre, share your ideas and preferences, approve your 3D design, and your interiors are made in our factory and installed by our team.')
body += section(sh('Three stages', 'From first meeting <em>to handover.</em>') + steps3(), '', 'Three stages', 'Get, Set and Go: fifteen steps.')
body += section(sh('In detail', 'What happens, <em>and when.</em>') + tlv([
    ('01 · GET', 'Meet your designer', 'Consult by video call or visit an experience centre. Share your ideas, needs, and design preferences.'),
    ('02 · GET', 'Initial design and booking', 'Explore styles and get answers from design experts. Then book with an advance and your designer measures the site.'),
    ('03 · SET', '3D model and design freeze', 'Approve your 3D design and fixed quote. That is Day 0 of your 30 days.*'),
    ('04 · SET', 'BOM and production drawings', 'Production drawings and bill of materials are prepared, and the site is validated before production begins.'),
    ('05 · GO', 'Factory production', 'Your modules move into our own factory – not a third-party workshop.'),
    ('06 · GO', 'Dispatch, installation and handover', 'Our own installation team fits your home, with a 100+ point quality check before final handover. Your 10-year warranty begins at handover.')]) +
    '<p class="note">%s</p>' % e(FOOT30), 'alt', 'In detail', 'Six moments from first call to handover.')
body += section(split(ST('plan-1'), 'A couple reviewing a home plan together', 'Your part', 'Share your ideas, <em>see them in 3D.</em>',
                      ['Consult by video call or visit an experience centre. Share your ideas, needs, and design preferences, and explore styles with design experts.'],
                      ['See finished modular and custom kitchens in person', 'Approve your 3D design and fixed quote', 'Handover on Day 30, and your 10-year warranty begins']), '', 'Your part', 'Share ideas, explore styles and approve your 3D design.')
body += section(faq_block('Process <em>questions</em>', 'Questions', F('start', 'time', 'changes', 'factory')), 'alt', 'Questions', 'Start, timeline, changes and the factory.')
body += recap() + cta('Ready for <em>step one?</em>', 'Call for a free design – a Homworks designer calls you within 24 hours.')
howto = {'@context': 'https://schema.org', '@type': 'HowTo', 'name': 'How Homworks designs and delivers your interiors', 'step': [
    {'@type': 'HowToSection', 'name': w, 'itemListElement': [{'@type': 'HowToStep', 'name': s, 'text': s} for s in it]} for w, it in HOW]}
add('how-it-works', 'How Homworks Works: Get, Set, Go | Interior Process', 'The Homworks process in three stages and 15 steps: meet your designer, approve your 3D design, and move in after factory production and installation.',
    body, 'why-homworks.html', F('start', 'time', 'changes', 'factory'), extra_ld=[howto], crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('How It Works', 'how-it-works.html')], og=ST('plan-1'))

# ------------------------------------------------------------------ 30-DAY
body = hero_full([HOME, ('Why Homworks', 'why-homworks.html'), ('30-Day Delivery', None)], 'The 30-day promise', 'Flawless design at <em>matchless speed.</em>',
                 'Perfect interiors done in just 30 days. Or it’s free*',
                 [('Call for a FREE design**', 'contact.html', 'pink'), ('How it works', 'how-it-works.html', 'line')],
                 [('30', 'working days'), ('Day 0', 'is your design sign-off'), ('+10', 'days for NE India and out-of-inventory finishes'), ('10 years', 'warranty from handover')], ST('fam-1'), 'An Indian family laughing together on a sofa at home')
body += answer('How long does Homworks take?', 'Homworks finishes your interiors in just 30 working days from design sign-off, or it’s free*.',
               'Day 0 is the day you approve your 3D design and fixed quote. ' + FOOT30[2:])
body += section(sh('The clock', 'Thirty days, <em>on the record.</em>') + tlv([
    ('Day 0', 'You approve your 3D design and fixed quote', 'That is Day 0 of your 30 days.* Your modules move into our own factory.'),
    ('Days 1–29', 'Factory production, dispatch and installation', 'Modules are made in our factory, delivered, and fitted by our own team.'),
    ('Day 30', 'Handover', 'A thorough 100+ point quality check before final handover, and your 10-year warranty begins.')]), '', 'The clock', 'Day 0 is sign-off; Day 30 is handover.')
body += section(sh('The terms', 'Clear terms, <em>no fine print.</em>', 'The 30 days count from sign-off, not from your first phone call.') + bento([
    ('text', 'Starts', 'When the clock starts', 'When you approve your 3D design and fixed quote.', ''), ('text', 'Excluded', 'What the guarantee excludes', 'Client-side delays, design changes and site readiness.', ''),
    ('stat', '+10', 'days for North East India and out-of-inventory finishes', 'dark'), ('text', 'Ends', 'When it ends', 'Handover on Day 30, when your 10-year warranty begins.', '')]) +
    '<p class="note">%s &nbsp; ** For one room only.</p>' % e(FOOT30), 'alt', 'The terms', 'What starts the clock, what is excluded and what adds days.')
body += pxb(ST('inst-1'), 'A kitchen being fitted on site', 'Get. Set. <em>Go.</em>', 'Fifteen steps, one accountable team.')
body += section(faq_block('Delivery <em>questions</em>', 'Questions', F('time', 'changes', 'factory', 'warranty')), '', 'Questions', 'Timeline, changes, factory and warranty.')
body += recap() + cta('Let’s get you <em>home on time.</em>', 'Call for a free design** – for one room only.')
add('30-day-delivery', 'The 30-Day Interior Delivery Promise | Homworks', 'Homworks delivers perfect interiors in just 30 working days from design sign-off, or it’s free*. See what starts the clock and the exact terms.',
    body, 'why-homworks.html', F('time', 'changes', 'factory', 'warranty'), crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('30-Day Delivery', '30-day-delivery.html')], og=ST('fam-1'))

# ------------------------------------------------------------------ QUALITY
CERT = [('isi', 'BIS ISI MARK', 'Licences IS 17634 & IS 17635'), ('gicg', 'ISO 9001:2015', 'Quality Management · GICG'), ('gicg', 'ISO 14001:2015', 'Environmental Management · GICG'),
        ('gicg', 'ISO 45001:2018', 'Health & Safety · GICG'), ('rehau', 'REHAU', 'ISO 9001 & 14001 certified edge band'), ('tuv', 'TÜV RHEINLAND', 'RoHS test report: PASS'),
        ('technomelt', 'TECHNOMELT PUR', 'Henkel hot-melt adhesives'), ('fasto', 'FASTO REDISIL', 'Silicone sealants')]
body = hero_full([HOME, ('Why Homworks', 'why-homworks.html'), ('Quality & Factory', None)], 'Quality & factory', 'Rigorous quality, <em>from raw material to handover.</em>',
                 'We subject every raw material to a rigorous quality control mandate before it reaches your home.',
                 [('Call for a FREE design', 'contact.html', 'pink'), ('Warranty', 'warranty-after-sales.html', 'line')],
                 [('100+', 'point quality check'), ('2×', 'material testing'), ('16', 'checks in the Interior Guide'), ('10 years', 'warranty')], ST('fac-2'), 'An operator at a CNC machine in a factory', dark=True)
body += answer('Quality at Homworks', 'Homworks tests every material twice – on arrival at the factory and again when it is issued to a project – in an in-house testing lab, and runs a 100+ point quality check before handover.',
               'Core boards are ISI-certified BWP / HDHMR E0, edges are PUR hot-melt banded, and hardware, joints, finishes and load are tested.')
body += statband([('72 hrs', 'boiling-water test on every BWP-grade plywood'), ('E0', 'grade core boards, with no formaldehyde'), ('80° C', 'heat the PUR edge-banding withstands'), ('18 mm', 'gap kept between the wall and the carcass')], 'dark')
body += section(sh('The 16 checks', 'What can go wrong, <em>and how we prevent it.</em>', 'Each point from the Homworks Interior Guide, with the standard we hold ourselves to.') + compare([(g[1], g[4], g[5]) for g in GD]), '', 'The 16 checks', 'What can go wrong, and the Homworks standard for each of 16 checks.')
body += pxb(ST('cnc-3'), 'A technician adjusting a CNC machine head', 'Tested twice. <em>Checked 100+ times.</em>', 'In an in-house testing lab at our factory.')
body += section(sh('Certified', 'Certificates and <em>test records.</em>', 'A claim about quality is only as good as the record behind it.') + '<ul class="certs stagger">%s</ul>' % ''.join(
    '<li class="rv">%s<b>%s</b><span>%s</span></li>' % (img('assets/home5/cert/%s.webp' % k, t + ' logo'), e(t), e(s)) for k, t, s in CERT), 'alt', 'Certified', 'ISI, ISO, REHAU, TÜV, Technomelt and Fasto.')
body += recap() + cta('See the standard <em>for yourself.</em>', 'Call for a free design, and ask for a tested sample of the core materials.')
add('quality-factory', 'Quality & Factory: ISI Boards, 72-Hour Boil Test | Homworks', 'Inside the Homworks factory: ISI-certified BWP / HDHMR E0 boards, 72-hour boiling test, PUR edge-banding, an in-house testing lab and a 100+ point quality check.',
    body, 'why-homworks.html', [(g[6].strip('“”"'), 'The Homworks standard: ' + g[5]) for g in GD], crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('Quality & Factory', 'quality-factory.html')], og=ST('fac-2'))

# ------------------------------------------------------------------ WARRANTY
body = hero_split([HOME, ('Why Homworks', 'why-homworks.html'), ('Warranty & After-Sales', None)], 'Warranty & after-sales', 'A <em>10-year</em> warranty, real after-sales.',
                  'Every project is backed by our warranty and prompt after-sales service.',
                  [('Call for a FREE design', 'contact.html', 'solid'), ('Contact us', 'contact.html', 'line')],
                  [('10 years', 'warranty on every project'), ('Day 30', 'warranty begins at handover'), ('1800 833 4500', 'toll-free')],
                  ST('fam-2'), 'An Indian family celebrating a festival at home', pill='Handover on Day 30', rev=True,
                  glass=('Covered for 10 years', ['Cabinetry', 'Carcass', 'Mechanisms']))
body += answer('What is Homworks’ warranty?', 'Every Homworks project carries a 10-year warranty on cabinetry, carcass and mechanisms, starting at handover.',
               'A dedicated after-sales team supports anything that needs a visit. Ask your designer for the written terms before you sign off.')
body += statband([('10 years', 'warranty on cabinetry, carcass and mechanisms'), ('Day 30', 'when the warranty begins'), ('100+', 'point quality check before handover'), ('1', 'toll-free number: 1800 833 4500')])
body += section(sh('What backs the warranty', 'Built so the warranty <em>rarely matters.</em>') + bento([
    ('img', ST('inst-2'), 'A cabinet door being checked', 'Tested hardware and joints', 'A drawer and shutter cycle test for runners and hinges, and a compression test for the dowel.', 'w2 h2'),
    ('text', '01', 'Tested boards', 'ISI-certified BWP / HDHMR E0 core boards in every carcass.', ''),
    ('text', '02', 'Double-carcass boxes', 'A single unit can be replaced easily without disturbing the other cabinets.', ''),
    ('text', '03', 'After-sales that answers', 'A dedicated after-sales team supports anything that needs a visit.', 'w2')]), '', 'What backs it', 'Tested boards, hardware, double carcasses and after-sales.')
body += section(faq_block('Warranty <em>questions</em>', 'Questions', F('warranty', 'board', 'wet', 'start')), 'alt', 'Questions', 'Warranty, boards, heat and moisture, and how to start.')
body += recap() + cta('Need help <em>with something?</em>', 'Call us toll-free or write to us – the Homworks team will follow up.')
add('warranty-after-sales', '10-Year Warranty & After-Sales Service | Homworks', 'Every Homworks project carries a 10-year warranty on cabinetry, carcass and mechanisms, with a dedicated after-sales team.',
    body, 'why-homworks.html', F('warranty', 'board', 'wet', 'start'), crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('Warranty & After-Sales', 'warranty-after-sales.html')], og=ST('fam-2'))

# ------------------------------------------------------------------ PROJECTS
WORKS = [('work-1', 'Contemporary Indian Living', 'Indiranagar, Bengaluru'), ('work-2', 'The Modern Family Lounge', 'Adyar, Chennai'),
         ('work-3', 'Modern Living, Refined', 'Jubilee Hills, Hyderabad'), ('work-4', 'The Urban Indian Home', 'Adyar, Chennai')]
wimg = ['assets/home5/%s.webp' % w[0] for w in WORKS]
body = hero_type([HOME, ('Projects', None)], 'Completed works', 'Bespoke homes <em>crafted from the ground up</em>', 'A look at homes designed, made and installed by Homworks.',
                 [('Call for a FREE design', 'contact.html', 'solid'), ('Browse by room', 'interiors.html', 'line')], strip=wimg)
body += statband([('14,000+', 'happy homes'), ('6', 'cities'), ('30', 'days from sign-off*'), ('10 years', 'warranty')])
body += section(sh('Featured works', 'Homes that <em>work beautifully.</em>', 'Each home is designed around the people who live in it, then made in our factory and fitted by our team.') +
                '<div class="mos stagger">%s</div>' % ''.join('<figure class="mo rv"><div>%s</div><figcaption><b>%s</b><span>%s</span></figcaption></figure>' % (img('assets/home5/%s.webp' % w[0], w[1] + ', ' + w[2]), e(w[1]), e(w[2])) for w in WORKS),
                '', 'Featured works', 'Four Homworks homes in Bengaluru, Chennai and Hyderabad.')
body += section(sh('Find your room', 'Start with the room <em>that matters most.</em>') + rail([
    ('modular-kitchens.html', ST('kit-island'), 'A modular kitchen', 'Kitchen', 'Modular kitchens', P[2]['p']),
    ('living-rooms.html', ST('living-tv'), 'A living room TV wall', 'Living', 'Living rooms', P[1]['p']),
    ('bedrooms.html', ST('bed-1'), 'A bedroom', 'Bedroom', 'Bedrooms', P[3]['p']),
    ('wardrobes.html', ST('ward-2'), 'A walk-in wardrobe', 'Storage', 'Wardrobes', 'L-shaped corner wardrobes and walk-ins.'),
    ('full-home-interiors.html', ST('living-2'), 'A finished living and dining room', 'Whole home', 'Full home interiors', P[0]['p'])], 'Room photos are illustrative stock photography.'), 'alt', 'Find your room', 'Kitchens, living rooms, bedrooms, wardrobes and full homes.')
body += recap() + cta('Let’s build <em>yours next.</em>', 'Call for a free design and meet a Homworks designer within 24 hours.')
add('projects', 'Completed Homes & Featured Works | Homworks', 'Featured Homworks homes in Bengaluru, Chennai and Hyderabad – bespoke interiors designed, made in our factory and installed by our own team.',
    body, 'projects.html', None, crumbs=[HOME, ('Projects', 'projects.html')], og='assets/home5/work-1.webp', typ='CollectionPage')

# ------------------------------------------------------------------ LOCATIONS (one page: every centre)
body = hero_type([HOME, ('Location', None)], 'Locations', 'A Homworks centre <em>near you.</em>', 'Meet a designer and see Homworks interiors at one of our six centres.',
                 [('Call %s' % PHONE, 'tel:' + PHONE_TEL, 'solid'), ('Book a FREE consultation', 'contact.html', 'line')],
                 strip=[ST(x) for x in ('kit-white', 'living-2', 'bed-1', 'kit-island', 'ward-2', 'kit-modern')])
body += answer('Where is Homworks?', 'Homworks has centres in Coimbatore, Chennai, Bangalore, Erode, Hyderabad and Guwahati.',
               'The Homworks factory and corporate office are in Peelamedu, Coimbatore. Call 1800 833 4500 to reach any centre.')
body += section(sh('Our centres', 'Six cities, <em>one standard.</em>', 'Hover a city to see its address, phone and email. Click it to open the centre in Google Maps.') + citytiles(CITIES), '', 'Our centres', 'Coimbatore, Chennai, Bangalore, Erode, Hyderabad and Guwahati.')
city_qas, city_ld = [], []
for i, c in enumerate(CITIES):
    st, loc, reg, pin = STREET[c['slug']]
    maps = 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(c['address'])
    city_qas.append(('Where is the Homworks %s centre?' % c['name'], 'The Homworks %s centre (%s) is at %s.' % (c['name'], c['tag'].replace('·', '–'), c['address'])))
    lb = dict(ORG); lb.update({'@id': '%s/locations.html#%s' % (SITE, c['slug']), 'name': 'Homworks ' + c['name'], 'url': '%s/locations.html' % SITE, 'hasMap': 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(c['address']),
                               'address': {'@type': 'PostalAddress', 'streetAddress': st, 'addressLocality': loc, 'addressRegion': reg, 'postalCode': pin, 'addressCountry': 'IN'},
                               'areaServed': c['name'], 'parentOrganization': {'@id': SITE + '/#org'}})
    lb.pop('@context')
    city_ld.append(dict({'@context': 'https://schema.org'}, **lb))
body += statband([('6', 'cities'), ('1', 'factory, in Coimbatore'), ('30', 'days from sign-off*'), ('10 years', 'warranty everywhere')], 'dark')
LQ = F('cities', 'start', 'factory', 'time') + city_qas
body += section(faq_block('Location <em>questions</em>', 'Questions', LQ), '', 'Questions', 'Cities, how to start, the factory, timeline and each centre.')
body += recap() + cta('Find your nearest <em>Homworks team.</em>', 'Call for a free design and we will connect you to your city centre.')
ORG_LOCS = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': 'Homworks centres', 'itemListElement': [
    {'@type': 'ListItem', 'position': i + 1, 'name': 'Homworks ' + c['name'], 'url': '%s/locations.html#%s' % (SITE, c['slug'])} for i, c in enumerate(CITIES)]}
add('locations', 'Homworks Centres: Coimbatore, Chennai, Bangalore, Erode, Hyderabad, Guwahati', 'Find a Homworks interior design centre in Coimbatore, Chennai, Bangalore, Erode, Hyderabad or Guwahati. Addresses, phone number and directions on one page.',
    body, 'locations.html', LQ, extra_ld=[ORG_LOCS] + city_ld, crumbs=[HOME, ('Location', 'locations.html')], og=ST('kit-white'), typ='CollectionPage')

# ------------------------------------------------------------------ FAQS
faq_groups = [('The basics', [FAQ['cost'], FAQ['time'], FAQ['start'], FAQ['cities']]),
              ('Factory and installation', [FAQ_FULL['sawdust'], FAQ_FULL['whyoff'], FAQ_FULL['install'], FAQ_FULL['custom'], FAQ_FULL['dust'], FAQ['factory']]),
              ('Materials and finishes', [FAQ['board'], FAQ['wet'], FAQ['finish']]),
              ('Changes and warranty', [FAQ['changes'], FAQ['warranty']])]
allq = [q for _, g in faq_groups for q in g]
search = '<div class="fsearch rv"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="faqSearch" type="search" placeholder="Search the answers: warranty, boards, timeline…" aria-label="Search the FAQs"></div>'
body = hero_type([HOME, ('FAQs', None)], 'FAQs', 'You’ve got questions? <em>We’ve got answers.</em>', 'Straight answers on cost, timelines, materials, installation and warranty.',
                 [('Call for a FREE design', 'contact.html', 'solid'), ('The 16 key questions', 'why-homworks.html#the-16-questions', 'line')], extra=search)
side = '<nav class="fside rv" aria-label="FAQ topics"><p class="eyebrow">Topics</p>%s</nav>' % ''.join('<a href="#%s">%s<i>%d</i></a>' % (slug(g), e(g), len(q)) for g, q in faq_groups)
lists = ''.join('<div class="faqg" id="%s"><h3>%s</h3>%s</div>' % (slug(g), e(g), ''.join('<div class="qa"><button type="button" aria-expanded="false">%s<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="a"><p>%s</p></div></div>' % (e(q), e(a)) for q, a in it)) for g, it in faq_groups)
body += section('<div class="fwrap">%s<div class="rv d1" id="faqAll">%s<p class="fnone" hidden>No answers match that search. Call %s and we will help.</p></div></div>' % (side, lists, PHONE), '', 'Answers', 'Basics, factory and installation, materials and finishes, changes and warranty.')
body += '<div class="wrap"><p class="note">%s</p></div>' % e(FOOT30)
body += recap() + cta('Still have <em>a question?</em>', 'Call us toll-free or book a free consultation.')
add('faqs', 'FAQs: Cost, Timeline, Materials & Warranty | Homworks', 'Answers to common questions about Homworks interiors: cost, the 30-day timeline, factory-made furniture, boards, finishes, installation and warranty.',
    body, 'faqs.html', allq, crumbs=[HOME, ('FAQs', 'faqs.html')], og='assets/home5/faq-desk.webp')

# ------------------------------------------------------------------ CONTACT
opts = ''.join('<option>%s</option>' % c['name'] for c in CITIES) + '<option>Other city</option>'
needs = ''.join('<option>%s</option>' % n for n in ['Full home interiors', 'Modular kitchen', 'Wardrobes', 'Living room', 'Bedroom', 'Renovation'])
body = hero_split([HOME, ('Contact', None)], 'Contact', 'Make room for <em>finer living.</em>', 'Beautiful homes begin with Homworks. Tell us about your home and a designer will call you within 24 hours.',
                  [('Call %s' % PHONE, 'tel:' + PHONE_TEL, 'solid'), ('Email us', 'mailto:' + EMAIL, 'line')],
                  [('24 hrs', 'we call you back'), ('6', 'cities'), ('Free', 'design consultation')], ST('fac-1'), 'Workers on a modern woodworking factory floor in Coimbatore', pill='Made in our own factory')
body += section('<div class="contact"><form class="formcard rv" id="leadForm" novalidate><h2>Tell us a little about your home</h2><p class="fs">Our Homworks designer will call you within 24 hours to arrange your complimentary consultation.</p>'
                '<input required name="name" placeholder="Your full name" autocomplete="name" aria-label="Your full name"><div class="row"><input required type="tel" name="phone" placeholder="Phone number" autocomplete="tel" aria-label="Phone number"><input required type="email" name="email" placeholder="Email address" autocomplete="email" aria-label="Email address"></div>'
                '<select name="city" aria-label="Select your city"><option value="">Select your city</option>%s</select><select name="need" aria-label="What are you planning?"><option value="">What are you planning?</option>%s</select>'
                '<button class="btn pink" type="submit">Book my free consultation</button><p class="note">By submitting, you agree to receive a call or WhatsApp from Homworks about your project. We respect your privacy.</p>'
                '<div class="ok" id="ok" role="status">Your consultation request is in. We will be in touch very soon.</div></form>'
                '<ul class="cl rv d1"><li><b>Call us</b><span><a href="tel:%s">%s</a> (toll-free)</span></li><li><b>Email</b><span><a href="mailto:%s">%s</a></span></li><li><b>Coimbatore office</b><span>%s</span></li>'
                '<li><b>Other centres</b><span>%s</span></li></ul></div>' % (opts, needs, PHONE_TEL, PHONE, EMAIL, EMAIL, CITIES[0]['address'],
                ' · '.join('<a href="locations.html#%s">%s</a>' % (c['slug'], c['name']) for c in CITIES[1:])), '', 'Get in touch', 'Form, phone, email and our Coimbatore office.')
body += section(sh('Where your home is made', 'From this call to <em>our factory floor.</em>', 'Your interiors are engineered in our own Coimbatore factory, then fitted at your home by our installation team.') + bento([
    ('img', ST('fac-1'), 'Workers on a modern woodworking factory floor', 'Own factory, Coimbatore', 'CNC and flat-lamination machinery imported from Italy and Germany.', 'w2 h2'),
    ('img', ST('cnc-1'), 'An automated drilling and machining line', 'Made to the millimetre', 'Furniture parts are cut and fabricated off-site, so your home is not turned into a workshop.', ''),
    ('img', ST('fac-4'), 'Board stock being inspected in a materials warehouse', 'Tested twice', 'On arrival at the factory, and again when issued to a project.', ''),
    ('stat', '10 years', 'warranty on every project', 'dark w2')]), '', 'Our factory', 'Own Coimbatore factory, CNC machinery, material testing and a 10-year warranty.')
body += section(faq_block('Before you <em>call</em>', 'Questions', F('start', 'time', 'cost', 'cities')), 'alt', 'Questions', 'How to start, timeline, cost and cities.')
body += recap()
add('contact', 'Contact Homworks | Book a Free Design Consultation', 'Contact Homworks: call 1800 833 4500, email enquiry@homworks.com or book a free design consultation. A designer calls within 24 hours.',
    body, 'contact.html', F('start', 'time', 'cost', 'cities'), crumbs=[HOME, ('Contact', 'contact.html')], og=ST('fac-1'), typ='ContactPage')


# ------------------------------------------------------------------ write
def page_html(slug_, p):
    url = SITE + '/' + slug_ + '.html'
    lds = [ORG, crumbs_ld(p['crumbs'])] if p['crumbs'] else [ORG]
    if p['faq']:
        lds.append(faq_ld(p['faq']))
    lds += p['extra']
    lds.append({'@context': 'https://schema.org', '@type': p['typ'], 'name': p['title'], 'description': p['desc'], 'url': url, 'isPartOf': {'@id': SITE + '/#org'}})
    return '''<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>%s</title>
  <meta name="description" content="%s">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="%s">
  <meta property="og:type" content="website"><meta property="og:site_name" content="Homworks"><meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:url" content="%s"><meta property="og:image" content="%s/%s">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#054648">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&family=Manrope:wght@200..800&family=Public+Sans:wght@600&display=swap" rel="stylesheet">
  <script>(function(d){var e=d.documentElement;e.className+=' js';setTimeout(function(){if(!window.__hw5)e.classList.add('motion-off')},2600)})(document)</script>
  <link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="assets/favicon-64.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="stylesheet" href="assets/home5.css?v=r24"><link rel="stylesheet" href="assets/inner.css?v=r3"><link rel="stylesheet" href="assets/inner-fx.css?v=r6">
  %s
</head>
<body class="inner">
<div class="rprog" id="rprog" aria-hidden="true"><i></i></div>
%s
<main id="top">
%s
</main>
%s
<script src="assets/inner.js?v=r4"></script>
</body>
</html>
''' % (e(p['title']), e(p['desc']), url, e(p['title']), e(p['desc']), url, SITE, p['og'], '\n  '.join(ld(x) for x in lds), header_html(p['active'] if p['active'] in ('interiors.html', 'projects.html', 'locations.html', 'about-us.html', 'contact.html') else ''), p['body'], footer_html())


for slug_, p in PAGES.items():
    open(os.path.join(ROOT, slug_ + '.html'), 'w', encoding='utf-8').write(page_html(slug_, p))

urls = [(SITE + '/', '1.0')] + [(SITE + '/' + s + '.html', '0.8' if s in ('interiors', 'why-homworks', 'faqs', 'contact', 'locations') else '0.7') for s in PAGES]
open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    '  <url><loc>%s</loc><priority>%s</priority></url>\n' % u for u in urls) + '</urlset>\n')
open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write('User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' % SITE)
json.dump(sorted(BUILT), open(os.path.join(ROOT, 'tools', 'built.json'), 'w'))
print(len(PAGES), 'pages written')


# ------------------------------------------------------------------ homepage: same nav / footer / live links / SEO as the inner pages
def patch_home():
    p = os.path.join(ROOT, 'index.html')
    h = open(p, encoding='utf-8').read()
    h = re.sub(r'<header class="nav" id="nav">.*?</header>\s*<nav class="mnav".*?</nav>', lambda m: header_html('', home=True), h, count=1, flags=re.S)
    h = re.sub(r'<footer class="foot">.*?</footer>', lambda m: footer_core(), h, count=1, flags=re.S)

    def live(m):
        u = m.group(1)
        return 'href="%s"' % u if (u.split('#')[0] in BUILT) else m.group(0)
    h = re.sub(r'href="#" data-href="([^"]+)"', live, h)
    qa = re.findall(r'<div class="qa"><button type="button" aria-expanded="false">(.*?)<svg.*?<div class="a"><p>(.*?)</p>', h, flags=re.S)
    faqs = [(html.unescape(q), html.unescape(a)) for q, a in qa]
    desc = 'Homworks designs, makes and installs home interiors: perfect interiors in just 30 working days, or it’s free*. Own Coimbatore factory, 10-year warranty, six cities.'
    ttl = 'Homworks | Perfect Interiors in 30 Days, or It’s Free* | Home Interior Designers'
    seo = ('<!--seo-->\n  <link rel="canonical" href="%s/">\n  <meta name="robots" content="index,follow,max-image-preview:large">\n'
           '  <meta property="og:type" content="website"><meta property="og:site_name" content="Homworks"><meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:url" content="%s/"><meta property="og:image" content="%s/assets/home5/hero-after.webp">\n'
           '  <meta name="twitter:card" content="summary_large_image">\n  %s\n  %s\n  %s\n  <!--/seo-->') % (
        SITE, e(ttl), e(desc), SITE, SITE, ld(ORG), ld({'@context': 'https://schema.org', '@type': 'WebSite', 'name': 'Homworks', 'url': SITE + '/', 'publisher': {'@id': SITE + '/#org'}}),
        ld(faq_ld(faqs)) if faqs else '')
    if '<!--seo-->' in h:
        h = re.sub(r'<!--seo-->.*?<!--/seo-->', lambda m: seo, h, flags=re.S)
    else:
        h = h.replace('<link rel="stylesheet" href="assets/home5.css', seo + '\n  <link rel="stylesheet" href="assets/home5.css', 1)
    h = re.sub(r'<title>.*?</title>', lambda m: '<title>%s</title>' % e(ttl), h, count=1)
    h = re.sub(r'<meta name="description" content="[^"]*">', lambda m: '<meta name="description" content="%s">' % e(desc), h, count=1)
    open(p, 'w', encoding='utf-8').write(h)

    j = os.path.join(ROOT, 'assets', 'home5.js')
    s2 = open(j, encoding='utf-8').read()
    live_js = ("/*LIVE*/var LIVE=%s;function lk(u){return LIVE.indexOf(u)>-1?u:'#'}"
               "$$('a[data-href]').forEach(function(a){var u=a.getAttribute('data-href');if(LIVE.indexOf(u.split('#')[0])>-1)a.setAttribute('href',u)});/*/LIVE*/") % json.dumps(sorted(BUILT))
    s2 = re.sub(r'/\*LIVE\*/.*?/\*/LIVE\*/', lambda m: live_js, s2, flags=re.S)
    open(j, 'w', encoding='utf-8').write(s2)


patch_home()
print('homepage patched')
