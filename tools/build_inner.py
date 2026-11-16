"""Generates the Homworks inner pages as static, crawlable HTML in the homepage theme.

Run:  node tools/extract_data.js tools/data.json && python tools/build_inner.py
Only facts that already exist on the homepage, in the Interior Guide data or in the old site data are used.
"""
import json, os, re, html, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'tools', 'data.json'), encoding='utf-8'))
SITE = 'https://homworks.com'          # canonical base; change here if the live domain differs
PHONE, PHONE_TEL, EMAIL = '1800 833 4500', '18008334500', 'enquiry@homworks.com'
FOOT30 = '* Guarantee excludes client-side delays, design changes, site readiness. +10 days for North East India and out-of-inventory finishes.'
e = lambda t: html.escape(t, quote=True)
ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

# ------------------------------------------------------------------ data
KL = D['KL']; CITIES = D['CITIES']; GD = D['GD']; P = D['P']; FIN = D['FIN']
KIMG = {'l-shaped': 'kitchen-l-shaped', 'u-shaped': 'kitchen-u-shaped', 'galley': 'kitchen-galley', 'one-wall': 'kitchen-straight', 'peninsular': 'kitchen-peninsular', 'island': 'kitchen-island'}
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

BUILT = set()   # filled below

# ------------------------------------------------------------------ chrome
MEGA = [
    ('Interiors', 'interiors.html', [
        ('Rooms', [('Full Home Interiors', 'A cohesive plan for every space', 'full-home-interiors.html'),
                   ('Modular Kitchens', 'Six layouts in six styles', 'modular-kitchens.html'),
                   ('Living Rooms', 'Console, partition, wall panel and TV units', 'living-rooms.html'),
                   ('Bedrooms', 'Cots crafted for comfort', 'bedrooms.html'),
                   ('Wardrobes', 'L-shaped to walk-in', 'wardrobes.html')]),
        ('Kitchen layouts', [(l['name'], l['bestFor'], 'kitchen-%s.html' % l['slug']) for l in KL])],
     ('Perfect interiors', 'Done in just 30 days.', 'Your interiors done in just 30 working days. Or it’s free*', '30-day-delivery.html', 'See the 30-day promise')),
    ('Projects', 'projects.html', [
        ('Explore homes', [('Featured works', 'Bespoke homes crafted from the ground up', 'projects.html'),
                           ('Full home interiors', 'Whole-home design, one team', 'full-home-interiors.html')]),
        ('Browse by room', [('Modular kitchens', 'Six layouts', 'modular-kitchens.html'), ('Living rooms', 'Entertainment spaces', 'living-rooms.html'),
                            ('Bedrooms', 'Cots and kids’ rooms', 'bedrooms.html')])],
     ('See it built', 'Find a home like yours.', 'Browse the homes we have crafted from the ground up.', 'projects.html', 'Featured works')),
    ('Why Homworks', 'why-homworks.html', [
        ('Our promise', [('About Homworks', 'Who we are', 'about-us.html'), ('How it works', 'Get, Set, Go', 'how-it-works.html'),
                         ('30-day delivery', 'The promise, with its terms', '30-day-delivery.html')]),
        ('Our standards', [('Quality & factory', 'Tested materials, own factory', 'quality-factory.html'),
                           ('Warranty & after-sales', '10 years, one clear promise', 'warranty-after-sales.html'),
                           ('16 key questions', 'Ask them before you choose', 'why-homworks.html#questions')])],
     ('Every detail matters', 'Checked, so you don’t have to.', 'Surface inspection under calibrated light. Because, every single detail matters.', 'why-homworks.html', 'Why Homworks')),
    ('Location', 'locations.html', [
        ('Our centres', [(c['name'], c['tag'], 'location-%s.html' % c['slug']) for c in CITIES[:3]]),
        ('More centres', [(c['name'], c['tag'], 'location-%s.html' % c['slug']) for c in CITIES[3:]])],
     ('Visit a Homworks centre', 'Meet a designer.', 'Find your nearest centre and talk to the team in person.', 'locations.html', 'Find your centre')),
]
TOP = [('FAQs', 'faqs.html'), ('Contact', 'contact.html')]
NAV_ACTIVE = {}


def nav_html(active=''):
    out = []
    for label, href, cols, feat in MEGA:
        h = '<div class="ni"><a class="ni-a" href="%s" aria-haspopup="true"%s>%s</a><div class="mega" role="group" aria-label="%s">' % (href, ' aria-current="page"' if active == href else '', label, label)
        for ch, links in cols:
            h += '<div class="mg-col"><h4>%s</h4>' % e(ch)
            for t, d, u in links:
                h += '<a class="mg-link" href="%s"><b>%s</b><small>%s</small></a>' % (u, e(t), e(d))
            h += '</div>'
        h += '<div class="mg-feat"><span>%s</span><b>%s</b><p>%s</p><a href="%s">%s <i>→</i></a></div></div></div>' % (e(feat[0]), e(feat[1]), e(feat[2]), feat[3], e(feat[4]))
        out.append(h)
    for label, href in TOP:
        out.append('<div class="ni"><a class="ni-a" href="%s"%s>%s</a></div>' % (href, ' aria-current="page"' if active == href else '', label))
    nav = '<nav class="nav-links" aria-label="Primary">\n    ' + '\n    '.join(out) + '\n  </nav>'
    mob = '<nav class="mnav" id="mnav" aria-label="Mobile">\n' + ''.join('  <a href="%s">%s</a>\n' % (h, l) for l, h in
          [('Interiors', 'interiors.html'), ('Projects', 'projects.html'), ('Why Homworks', 'why-homworks.html'), ('Location', 'locations.html'), ('FAQs', 'faqs.html'), ('Contact', 'contact.html')]) + \
          '  <a class="go" href="contact.html">Book a FREE Consultation</a>\n</nav>'
    return nav, mob


def header_html(active=''):
    nav, mob = nav_html(active)
    return ('<header class="nav" id="nav">\n  <a class="nav-logo" href="index.html" aria-label="Homworks home"><img src="assets/home5/logo-nav.svg" alt="Homworks" width="176" height="42"></a>\n  '
            + nav + '\n  <a class="nav-cta" href="contact.html">Book a FREE Consultation</a>\n'
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


# ------------------------------------------------------------------ components
def img(src, alt, eager=False):
    return '<img src="%s" alt="%s" %s>' % (src, e(alt), 'fetchpriority="high"' if eager else 'loading="lazy"')


def hero(crumbs, eyebrow, h1, lede, ctas, facts, image, alt, pill=None, glass=None):
    c = '<nav class="crumb" aria-label="Breadcrumb">' + '<i>/</i>'.join(
        ('<a href="%s">%s</a>' % (u, e(n)) if u else '<span aria-current="page">%s</span>' % e(n)) for n, u in crumbs) + '</nav>'
    b = ''.join('<a class="btn %s" href="%s">%s%s</a>' % (k, u, e(l), ARROW if k == 'solid' else '') for l, u, k in ctas)
    f = '<ul class="facts">' + ''.join('<li><b>%s</b><span>%s</span></li>' % (e(x), e(y)) for x, y in facts) + '</ul>' if facts else ''
    g = ''
    if glass:
        g = '<div class="glass"><h4>%s</h4><ul>%s</ul></div>' % (e(glass[0]), ''.join('<li>%s</li>' % e(x) for x in glass[1]))
    p = '<span class="pill"><i></i><span>%s</span></span>' % e(pill) if pill else ''
    return '''<section class="ph2"><div class="wrap ph2-in">
  <div class="rv">%s<p class="eyebrow">%s</p><h1>%s</h1><p class="lede">%s</p><div class="btns">%s</div>%s</div>
  <div class="ph2-img rv d1"><figure>%s</figure>%s%s</div>
</div></section>''' % (c, e(eyebrow), h1, e(lede), b, f, img(image, alt, True), p, g)


def sh(eyebrow, h2, p='', center=False):
    return '<div class="sh%s rv"><div><p class="eyebrow">%s</p><h2 class="h2">%s</h2></div>%s</div>' % (' c' if center else '', e(eyebrow), h2, '<p>%s</p>' % e(p) if p else '')


def answer(title, p1, p2=''):
    return '<div class="wrap"><div class="answer rv"><h2>%s</h2><div><p>%s</p>%s</div></div></div>' % (e(title), e(p1), '<p>%s</p>' % e(p2) if p2 else '')


def is_small(src):
    try:
        from PIL import Image
        return Image.open(os.path.join(ROOT, src)).size[0] < 400
    except Exception:
        return False


def card(href, src, alt, tag, title, body, more='Explore'):
    t = 'a' if href else 'div'
    cls = 'card rv' + (' thumb' if is_small(src) else '')
    fmt = '<%s class="' + cls + '"%s><figure>%s</figure><div class="cb"><span class="tag">%s</span><h3>%s</h3><p>%s</p>%s</div></%s>'
    return fmt % (
        t, ' href="%s"' % href if href else '', img(src, alt), e(tag), e(title), e(body), '<span class="more">%s%s</span>' % (e(more), ARROW) if href else '', t)


def flat(no, title, body):
    return '<div class="card flat rv"><span class="no">%s</span><h3>%s</h3><p>%s</p></div>' % (e(no), e(title), e(body))


def grid(cls, items): return '<div class="grid %s">%s</div>' % (cls, ''.join(items))


def section(inner, cls='', sid=''):
    return '<section class="sec %s"%s><div class="wrap">%s</div></section>' % (cls, ' id="%s"' % sid if sid else '', inner)


def split(src, alt, eyebrow, h2, paras, ticks=None, rev=False, links=None):
    body = '<p class="eyebrow">%s</p><h2 class="h2">%s</h2><div class="prose" style="margin-top:20px">%s</div>' % (e(eyebrow), h2, ''.join('<p>%s</p>' % e(x) for x in paras))
    if ticks:
        body += '<ul class="ticks">' + ''.join('<li><span>%s</span></li>' % t for t in ticks) + '</ul>'
    if links:
        body += '<div class="btns">' + ''.join('<a class="btn %s" href="%s">%s</a>' % (k, u, e(l)) for l, u, k in links) + '</div>'
    return '<div class="split%s"><div class="rv">%s</div><figure class="rv d1">%s</figure></div>' % (' rev' if rev else '', body, img(src, alt))


def faq_block(title, eyebrow, qas, groups=None):
    rows = lambda items: ''.join('<div class="qa"><button type="button" aria-expanded="false">%s<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="a"><p>%s</p></div></div>' % (e(q), e(a)) for q, a in items)
    if groups:
        lst = ''.join('<div class="faqg"><h3>%s</h3>%s</div>' % (e(g), rows(it)) for g, it in groups)
    else:
        lst = rows(qas)
    return '<div class="faqw"><div class="rv"><p class="eyebrow">%s</p><h2 class="h2">%s</h2></div><div class="rv d1">%s</div></div>' % (e(eyebrow), title, lst)


def cta(h2, p, primary=('Book a FREE consultation', 'contact.html'), second=('Call %s' % PHONE, 'tel:' + PHONE_TEL)):
    return '<section class="cta3"><div class="wrap"><div class="rv"><h2>%s</h2><p>%s</p></div><div class="btns rv d1"><a class="btn pink" href="%s">%s%s</a><a class="btn line" href="%s">%s</a></div></div></section>' % (
        h2, e(p), primary[1], e(primary[0]), ARROW, second[1], e(second[0]))


def band(items):
    return '<section class="band"><div class="wrap"><ul>%s</ul></div></section>' % ''.join('<li class="rv"><b>%s</b><span>%s</span></li>' % (e(a), e(b)) for a, b in items)


def steps3():
    data = [('GET', ['Meet your designer', 'Requirement gathering', 'Initial design', 'Booking advance', 'Site measurement']),
            ('SET', ['3D model + Quality check', 'Design freeze', 'BOM + Production drawings', 'Site validation', 'Final sign-off']),
            ('GO', ['Execution begins', 'Factory production', 'Site readiness', 'Dispatch & delivery', 'Installation, QC, Handover'])]
    return '<div class="stepsx">' + ''.join('<div class="stp rv"><span class="no">0%d</span><h3>%s</h3><ul>%s</ul></div>' % (i + 1, w, ''.join('<li>%s</li>' % e(x) for x in it)) for i, (w, it) in enumerate(data)) + '</div>'


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


def add(slug, title, desc, body, active='', faq=None, extra_ld=None, crumbs=None, og='assets/home5/hero-after.webp', typ='WebPage'):
    PAGES[slug] = dict(title=title, desc=desc, body=body, active=active, faq=faq, extra=extra_ld or [], crumbs=crumbs or [], og=og, typ=typ)
    BUILT.add(slug + '.html')


# ------------------------------------------------------------------ pages
HOME = ('Home', 'index.html')


def hub_cards():
    items = [('full-home-interiors.html', 'assets/home5/card-2.webp', 'Full home interior design by Homworks', 'Whole home', 'Full Home Interiors', 'A cohesive plan for every space, with one team accountable from the first design to final handover.'),
             ('modular-kitchens.html', 'assets/home5/card-0.webp', 'Modular kitchen designed by Homworks', 'Kitchen', 'Modular Kitchens', 'Pick from 6 layouts in 6 styles, shaped around people who use it.'),
             ('living-rooms.html', 'assets/home5/card-1.webp', 'Living room storage and TV unit by Homworks', 'Living', 'Living Rooms', 'Console units, partitions, wall panels and TV units – let custom cabinets become style statements.'),
             ('bedrooms.html', 'assets/home5/card-3.webp', 'Bedroom with cot and wardrobe by Homworks', 'Bedroom', 'Bedrooms', 'Made from quality materials, our cots are the foundation for your dreams – styled to suit your interior.'),
             ('wardrobes.html', 'assets/home/wardrobe-walk-in.jpg', 'Walk-in wardrobe by Homworks', 'Storage', 'Wardrobes', 'From the L-shaped corner wardrobe to the walk-in, built to use every inch.')]
    return [card(*i) for i in items]


# --- interiors hub
body = hero([HOME, ('Interiors', None)], 'Interiors', 'When rooms <em>become masterpieces…</em>',
            'Kitchens, bedrooms, wardrobes, living rooms, kids’ rooms - we turn blueprints into beautiful spaces.',
            [('Book a FREE consultation', 'contact.html', 'solid'), ('See how it works', 'how-it-works.html', 'line')],
            [('30', 'days from design sign-off*'), ('10 years', 'warranty'), ('6', 'kitchen layouts')],
            'assets/home5/card-2.webp', 'A finished Homworks living and dining interior', pill='Every room, one team',
            glass=('One team, start to handover', ['Design and 3D plan', 'Made in our own factory', 'Fitted by our installation team']))
body += section(sh('Browse by room', 'Find the space that <em>fits your life.</em>', 'Each room is designed around how your family lives, then made in our own factory and installed by our own team.') + grid('g3', hub_cards() + [
    card('modular-kitchens.html#layouts', 'assets/home/kitchen-l-shaped.jpg', 'L-shaped modular kitchen', 'Layouts', 'Six kitchen layouts', 'L-shaped, U-shaped, galley, one-wall, peninsular and island kitchens.')]))
body += answer('What Homworks designs', 'Homworks designs, manufactures and installs full home interiors, modular kitchens, living room units, bedrooms, cots and wardrobes.',
               'Every project has one team accountable from the first design to final handover, a 30-day delivery promise* and a 10-year warranty.')
body += section(sh('Finishes', 'A spectrum of <em>texture &amp; colour</em>', 'Choose from lamination, membrane, acrylic and PU paint finishes.') + grid('g4', [
    card(None, 'assets/home5/fan-lamination.webp', 'Lamination finish sample', 'Finish', 'Lamination', FIN[0][1][0][1]),
    card(None, 'assets/home5/fan-membrane.webp', 'Membrane finish sample', 'Finish', 'Membrane', FIN[1][1][0][1]),
    card(None, 'assets/home5/fan-acrylic.webp', 'Acrylic finish sample', 'Finish', 'Acrylic', FIN[2][1][0][1]),
    card(None, 'assets/home5/fan-pu.webp', 'PU paint finish sample', 'Finish', 'PU paint', FIN[3][1][0][1])]), 'alt')
body += section(faq_block('Before you <em>start</em>', 'Questions', F('cost', 'time', 'finish', 'start')))
body += cta('Not sure where <em>to start?</em>', 'Call for a free design – a Homworks designer calls you within 24 hours.')
add('interiors', 'Interior Design for Every Room | Homworks', 'Homworks designs, makes and installs kitchens, bedrooms, wardrobes and living rooms in 30 days from sign-off, with a 10-year warranty.',
    body, 'interiors.html', F('cost', 'time', 'finish', 'start'), crumbs=[HOME, ('Interiors', 'interiors.html')])

# --- full home
fh_cards = [card(None, 'assets/' + c[1], c[2] + ' interior by Homworks', 'Room', c[2], c[3]) for c in P[0]['cards']]
body = hero([HOME, ('Interiors', 'interiors.html'), ('Full Home Interiors', None)], 'Full home interiors', 'Custom designs <em>for each room</em>',
            'A cohesive plan for every space, with one team accountable from the first design to final handover.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('The Homworks process', 'how-it-works.html', 'line')],
            [('1', 'accountable team'), ('30', 'days from sign-off*'), ('10 years', 'warranty')],
            'assets/home5/card-2.webp', 'A full home interior designed and installed by Homworks', pill='One plan, every room',
            glass=('What one team covers', ['3D design and fixed quote', 'Factory production', 'Installation, QC, handover']))
body += answer('Full home interiors at Homworks', 'Homworks plans, manufactures and installs interiors for every room of your home as one project, with one team accountable from the first design to final handover.',
               'Your 3D design and fixed quote are approved once, the clock starts at sign-off, and your 10-year warranty begins at handover.')
body += section(sh('Room by room', 'One plan, <em>every room.</em>', 'Start with the rooms that matter most, or let the plan cover the whole home.') + grid('g3', [
    card('modular-kitchens.html', 'assets/home5/card-0.webp', 'Modular kitchen', 'Kitchen', 'Modular kitchen', P[2]['p']),
    card('living-rooms.html', 'assets/home5/card-1.webp', 'Living room units', 'Living', 'Living room', P[1]['p']),
    card('bedrooms.html', 'assets/home5/card-3.webp', 'Bedroom', 'Bedroom', 'Bedroom', P[3]['p'])] + fh_cards))
body += section(split('assets/home5/why-photo.webp', 'A Homworks craftsperson fitting a drawer', 'Why one team', 'Nothing gets lost <em>between rooms.</em>',
                      ['When one team owns design, production and installation, decisions made in the kitchen carry through to the wardrobes and the living room.',
                       'Your furniture is made in our own factory and fitted at your home, so your rooms stay clean while the work is done.'],
                      ['<b>One design plan</b> – a cohesive plan for every space.', '<b>Module-wise pricing</b> – the quotation stays as close as possible to the final cost.', '<b>Made in-house</b> – CNC and flat-lamination machinery imported from Italy and Germany.'],
                      links=[('See the factory standard', 'quality-factory.html', 'line')]), 'alt')
body += section(sh('The process', 'The seamless <em>Homworks process</em>', 'A clear step-by-step path to a beautifully designed home.') + steps3())
body += section(faq_block('Full home <em>questions</em>', 'Questions', F('time', 'cost', 'changes', 'factory')), 'alt')
body += cta('Make your whole home <em>work beautifully.</em>', 'Call for a free design and meet a designer within 24 hours.')
add('full-home-interiors', 'Full Home Interior Design & Installation | Homworks', 'Full home interiors by Homworks: one team from design to handover, made in our own factory, 30 days from sign-off*, 10-year warranty.',
    body, 'interiors.html', F('time', 'cost', 'changes', 'factory'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Full Home Interiors', 'full-home-interiors.html')], typ='Service')

# --- modular kitchens
STYLES = ['Indian Classic', 'Contemporary', 'Indian Traditional', 'Minimalistic', 'Modern', 'English Classic']
kl_cards = [card('kitchen-%s.html' % l['slug'], 'assets/home/%s.jpg' % KIMG[l['slug']], '%s modular kitchen designed by Homworks' % l['name'], 'Best for ' + l['bestFor'], l['name'] + ' kitchen', l['blurb'], 'See the layout') for l in KL]
body = hero([HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', None)], 'Modular kitchens', 'The kitchen <em>of your dreams</em>',
            'Beyond just a place to cook, a space where families gather. Pick from 6 layouts in 6 styles, shaped around people who use it.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('Explore the 6 layouts', '#layouts', 'line')],
            [('6', 'layouts'), ('6', 'styles'), ('10 years', 'warranty')],
            'assets/home/kitchen-island.jpg', 'Island modular kitchen by Homworks', pill='6 layouts · 6 styles',
            glass=('Built for the kitchen', ['72-hour boiling-water tested plywood', 'PUR edge-banding, up to 80° C', '18mm gap from the wall']))
body += answer('Modular kitchens at Homworks', 'Homworks makes modular kitchens in six layouts – L-shaped, U-shaped, galley, one-wall, peninsular and island – and six styles, designed around your floor plan and made in its own factory.',
               'Kitchen carcasses use ISI-certified BWP / HDHMR E0 boards, and every project carries a 10-year warranty.')
body += section(sh('Choose a layout', 'Six layouts. <em>One right answer</em> for your home.', 'Each layout suits a different home size and way of cooking.') + grid('g3', kl_cards), '', 'layouts')
body += section(sh('Styles', 'Six styles, <em>shaped around you.</em>') + '<ul class="chips rv">' + ''.join('<li>%s</li>' % s for s in STYLES) + '</ul>', 'alt')
body += section(split('assets/home/factory-cnc.jpg', 'A CNC machine drilling a kitchen board in the Homworks factory', 'Built for a working kitchen', 'Heat, steam and <em>years of daily use.</em>',
                      ['Kitchens are damp, hot and wet places. Homworks tests, bonds and spaces every kitchen with that in mind.'],
                      ['<b>72-hour boiling test</b> – every BWP-grade plywood is tested in boiling water, with results recorded before use.', '<b>PUR hot-melt edge-banding</b> – ideal for high-temperature environments, withstanding up to 80° C.',
                       '<b>18mm wall gap</b> – keeps the core materials away from wall dampness, so the product lasts longer.', '<b>Double carcass</b> – a single unit can be replaced without disturbing the other cabinets.'],
                      links=[('The quality standard', 'quality-factory.html', 'line')]))
body += section(faq_block('Modular kitchen <em>questions</em>', 'Questions', F('wet', 'board', 'time', 'cost')), 'alt')
body += cta('Let’s plan your <em>perfect kitchen.</em>', 'Call for a free design and meet a kitchen designer within 24 hours.')
add('modular-kitchens', 'Modular Kitchen Designs in 6 Layouts & 6 Styles | Homworks', 'Modular kitchens by Homworks: L-shaped, U-shaped, galley, one-wall, peninsular and island layouts, made in our factory with a 10-year warranty.',
    body, 'interiors.html', F('wet', 'board', 'time', 'cost'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', 'modular-kitchens.html')], og='assets/home/kitchen-island.jpg', typ='Service')

# --- kitchen layouts
for l in KL:
    s = l['slug']; others = [o for o in KL if o['slug'] != s]
    pr = l['h1'].split('<br>')
    h1 = pr[0] + ' <em>' + pr[1] + '</em>'
    qas = [('Who is the %s kitchen best for?' % l['name'], 'Homworks recommends the %s kitchen for %s, typically in a footprint of %s. %s' % (l['name'], l['bestFor'], l['footprint'], l['blurb'])),
           ('What are the benefits of an %s kitchen?' % l['name'] if l['name'][0] in 'AEIOU' else 'What are the benefits of a %s kitchen?' % l['name'], ' '.join('%s. %s' % (p['t'], p['b']) for p in l['pros'])),
           FAQ['board'], FAQ['time']]
    body = hero([HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', 'modular-kitchens.html'), (l['name'], None)], 'Modular kitchens / ' + l['name'], h1,
                l['blurb'], [('Call for a FREE design', 'contact.html', 'solid'), ('All kitchen layouts', 'modular-kitchens.html#layouts', 'line')],
                [(l['footprint'], 'typical footprint'), (l['bestFor'], 'best for'), ('10 years', 'warranty')],
                'assets/home/%s.jpg' % KIMG[s], '%s modular kitchen by Homworks' % l['name'], pill=l['name'] + ' layout',
                glass=('At a glance', ['Best for ' + l['bestFor'], 'Footprint ' + l['footprint'], 'Six styles to choose from']))
    body += answer('%s kitchen at a glance' % l['name'], '%s It suits %s, in a typical footprint of %s.' % (l['blurb'], l['bestFor'], l['footprint']))
    body += section(sh('Why this layout', 'What the %s layout <em>gives you.</em>' % l['name']) + grid('g2', [flat('0%d' % (i + 1), p['t'], p['b']) for i, p in enumerate(l['pros'])]))
    body += section(split('assets/home/factory-cnc.jpg', 'CNC cutting of a kitchen board at the Homworks factory', 'Made to last', 'Engineered for <em>daily cooking.</em>',
                          ['Your %s kitchen is made in the Homworks factory in Coimbatore and fitted at your home.' % l['name'].lower()],
                          ['ISI-certified BWP / HDHMR E0 boards in every carcass', 'PUR hot-melt edge-banding, up to 80° C', 'An 18mm gap between wall and carcass', 'A 10-year warranty'],
                          rev=True), 'alt')
    body += section(sh('More layouts', 'Compare the <em>other five.</em>') + grid('g3', [card('kitchen-%s.html' % o['slug'], 'assets/home/%s.jpg' % KIMG[o['slug']], '%s modular kitchen' % o['name'], 'Best for ' + o['bestFor'], o['name'] + ' kitchen', o['blurb'], 'See the layout') for o in others[:3]]))
    body += section(faq_block('%s kitchen <em>questions</em>' % l['name'], 'Questions', qas), 'alt')
    body += cta('Planning an %s kitchen?' % l['name'] if l['name'][0] in 'AEIOU' else 'Planning a %s kitchen?' % l['name'], 'Call for a free design and meet a kitchen designer within 24 hours.')
    add('kitchen-' + s, '%s Modular Kitchen Design | Homworks' % l['name'], '%s modular kitchen by Homworks: best for %s, %s footprint, made in our own factory with a 10-year warranty.' % (l['name'], l['bestFor'], l['footprint']),
        body, 'interiors.html', qas, crumbs=[HOME, ('Interiors', 'interiors.html'), ('Modular Kitchens', 'modular-kitchens.html'), (l['name'], 'kitchen-%s.html' % s)], og='assets/home/%s.jpg' % KIMG[s], typ='Service')

# --- living rooms
LIV = [(c[0], c[1], c[2], c[3]) for c in P[1]['cards']]
body = hero([HOME, ('Interiors', 'interiors.html'), ('Living Rooms', None)], 'Living rooms', 'Enhancing your <em>entertainment space.</em>',
            'Console units, partitions, wall panels and TV units - let custom cabinets become style statements.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('See all rooms', 'interiors.html', 'line')],
            [('5', 'living unit styles'), ('30', 'days from sign-off*'), ('10 years', 'warranty')],
            'assets/home/living-room.jpg', 'A living room with TV wall and storage by Homworks', pill='Console · Partition · Panel · TV',
            glass=('Made for how you gather', ['Custom cabinets, made in-house', 'Floor-standing or wall-hung TV units', 'Partitions and wall panels']))
body += answer('Living room interiors at Homworks', 'Homworks makes console units, living partitions, wall panels and TV units – floor-standing or wall-hung – as custom cabinets designed around your room.',
               'Cabinets are the most underrated, trend-making part of a living room.')
body += section(sh('The living room range', 'Cabinets that become <em>style statements.</em>') + grid('g3', [
    card(None, 'assets/' + c[1], c[2] + ' by Homworks', 'Living', c[2], c[3]) for c in P[1]['cards']]), '', 'units')
body += section(split('assets/home/tv-wall-hung.jpg', 'A wall-hung TV unit by Homworks', 'TV units', 'Floor-standing <em>or wall-hung.</em>',
                      [P[1]['cards'][3][3], P[1]['cards'][4][3]],
                      ['<b>Floor-standing</b> – low cabinets on a baseboard, for a contemporary look.', '<b>Wall-hung</b> – floating cabinets that leave the floor clear; a plinth can be added.']), 'alt')
body += section(faq_block('Living room <em>questions</em>', 'Questions', F('finish', 'factory', 'time', 'cost')))
body += cta('Give your living room <em>its statement.</em>', 'Call for a free design and meet a designer within 24 hours.')
add('living-rooms', 'Living Room & TV Unit Designs | Homworks', 'Console units, living partitions, wall panels and TV units by Homworks – custom cabinets made in our factory, with a 10-year warranty.',
    body, 'interiors.html', F('finish', 'factory', 'time', 'cost'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Living Rooms', 'living-rooms.html')], og='assets/home/living-room.jpg', typ='Service')

# --- bedrooms
BED = P[3]['cards']
body = hero([HOME, ('Interiors', 'interiors.html'), ('Bedrooms', None)], 'Bedrooms', 'Cots crafted <em>for comfort</em>',
            'Made from quality materials, our cots are the foundation for your dreams – styled to suit your interior.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('Wardrobes', 'wardrobes.html', 'line')],
            [('6', 'cot, wardrobe and kids’ designs'), ('30', 'days from sign-off*'), ('10 years', 'warranty')],
            'assets/home/bedroom.jpg', 'A bedroom with a cot and wardrobe by Homworks', pill='Cots · Wardrobes · Kids’ rooms',
            glass=('In the bedroom range', ['Hydraulic and storage cots', 'Fabric headboards', 'L-shaped and walk-in wardrobes']))
body += answer('Bedroom interiors at Homworks', 'Homworks makes cots, headboards, wardrobes and kids’ room furniture in its own factory, styled to suit your interior.',
               'Choose a hydraulic cot, a cot with built-in storage, a fabric headboard, or a bunk bed with a built-in staircase.')
body += section(sh('The bedroom range', 'Rest, <em>made to measure.</em>') + grid('g3', [card('wardrobes.html' if 'wardrobe' in c[1] else None, 'assets/' + c[1], c[2] + ' by Homworks', 'Bedroom', c[2], c[3]) for c in BED]), '', 'range')
body += section(split('assets/home/kids-bunk.jpg', 'A kids’ bunk bed with a built-in staircase by Homworks', 'Kids’ rooms', 'A bunk bed with <em>steps built in.</em>',
                      [BED[5][3], 'Kids’ rooms are designed around the same factory standard and 10-year warranty as the rest of your home.'],
                      ['Made from quality materials', 'Styled to suit your interior', 'Covered by a 10-year warranty']), 'alt')
body += section(faq_block('Bedroom <em>questions</em>', 'Questions', F('board', 'finish', 'warranty', 'time')))
body += cta('Make room for <em>finer living.</em>', 'Beautiful homes begin with Homworks. Call for a free design.')
add('bedrooms', 'Bedroom Interiors, Cots & Kids’ Rooms | Homworks', 'Cots, headboards, wardrobes and kids’ rooms by Homworks – made from quality materials in our own factory, with a 10-year warranty.',
    body, 'interiors.html', F('board', 'finish', 'warranty', 'time'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Bedrooms', 'bedrooms.html')], og='assets/home/bedroom.jpg', typ='Service')

# --- wardrobes
body = hero([HOME, ('Interiors', 'interiors.html'), ('Wardrobes', None)], 'Wardrobes', 'Storage that uses <em>every inch.</em>',
            'From the L-shaped corner wardrobe to the walk-in, built to make the most of your bedroom.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('Bedrooms', 'bedrooms.html', 'line')],
            [('2', 'signature wardrobe styles'), ('E0', 'grade boards'), ('10 years', 'warranty')],
            'assets/home/wardrobe-walk-in.jpg', 'A walk-in wardrobe by Homworks', pill='L-shaped · Walk-in',
            glass=('Built to hold', ['E0-grade double-side laminated boards', 'Soft, precise factory finish', 'Designed around your room']))
body += answer('Wardrobes at Homworks', 'Homworks builds L-shaped corner wardrobes and walk-in wardrobes in its own factory, designed around your room dimensions and storage needs.',
               'Boards are E0 grade, and furniture is made to the millimetre so fitting is smooth.')
wr = [c for c in BED if 'wardrobe' in c[1]]
body += section(sh('Wardrobe styles', 'Two ways to <em>store more.</em>') + grid('g2', [card(None, 'assets/' + c[1], c[2] + ' by Homworks', 'Wardrobe', c[2], c[3]) for c in wr]))
body += section(split('assets/home/materials.jpg', 'Finish samples for Homworks wardrobes', 'Finishes', 'Choose the finish <em>you will live with.</em>',
                      ['Wardrobes come in lamination, membrane, acrylic and PU paint finishes, in a wide range of designs, colours and finishing options.'],
                      ['Lamination: the most common finish; withstands rough surfaces.', 'Acrylic: a glassy, almost mirror-like surface with a plush sheen.', 'PU paint: protects the cabinets and lasts longer.']), 'alt')
body += section(faq_block('Wardrobe <em>questions</em>', 'Questions', F('board', 'finish', 'warranty', 'time')))
body += cta('Design a wardrobe <em>that fits you.</em>', 'Call for a free design and meet a designer within 24 hours.')
add('wardrobes', 'Wardrobe Designs: L-Shaped & Walk-In | Homworks', 'L-shaped and walk-in wardrobes by Homworks, made from E0-grade boards in our own factory with a 10-year warranty.',
    body, 'interiors.html', F('board', 'finish', 'warranty', 'time'), crumbs=[HOME, ('Interiors', 'interiors.html'), ('Wardrobes', 'wardrobes.html')], og='assets/home/wardrobe-walk-in.jpg', typ='Service')

# --- why homworks
WHY = [('Certified quality raw material', 'Every material clears a stringent QC process, from sourcing right through to installation.', 'w7-1'),
       ('Factory-made, fine finish', 'AI-supported design software and skilled workmanship for a flawless, factory-precise finish.', 'w7-2'),
       ('Unlimited choice', 'A wide range of designs, colours and finishing options for every room in your home.', 'w7-3'),
       ('10-year warranty, real after-sales', 'Every project is backed by our warranty and prompt after-sales service.', 'w7-4'),
       ('Superior, strong material', 'Selected hardwood core and face veneers, chosen for wear and damage resistance.', 'w7-5'),
       ('High screw-holding ability', 'High-density hardwood species give every joint exceptional holding strength.', 'w7-6'),
       ('Fungus & termite resistant', 'Treated against fungus, borer and termite, for interiors that are built to last.', 'w7-7'),
       ('Moisture resistant, precisely made', 'Moisture-resistant materials with precision-engineered dimensions – no room for error.', 'w7-8')]
body = hero([HOME, ('Why Homworks', None)], 'Why Homworks', 'Every <em>detail</em> is checked, so you don’t have to',
            'Surface inspection under calibrated light. Because, every single detail matters.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('The 16 key questions', '#questions', 'line')],
            [('100+', 'point quality check'), ('30', 'days from sign-off*'), ('10 years', 'warranty')],
            'assets/home5/why-hero.webp', 'Surface inspection of a wooden panel under calibrated light', pill='Leave the checking to us')
body += answer('Why choose Homworks', 'Homworks checks every raw material before it reaches your home, pairs AI-driven design software with skilled workmanship, and builds in its own factory to a 10-year warranty.',
               'From premium hardwood selection to advanced moisture resistance, your home is built to outlast trends - and withstand the test of time.')
body += section(sh('What sets us apart', 'Built to outlast <em>trends.</em>', 'We subject every raw material to a rigorous quality control mandate before it reaches your home.') + grid('g4', [card(None, 'assets/home5/%s.webp' % w[2], w[0], 'Standard', w[0], w[1]) for w in WHY]))
body += section(sh('The process', 'The seamless <em>Homworks process</em>', 'A clear step-by-step path to a beautifully designed home.') + steps3(), 'alt')
body += section('<div id="questions"></div>' + sh('The Interior Guide', '16 key questions <em>you need to ask.</em>', 'Your home’s quality and longevity will depend on the answers. Consider these points before you choose any interior designer – including us.') +
                '<div class="faqw" style="grid-template-columns:1fr"><div class="rv">%s</div></div>' % ''.join(
                    '<div class="qa"><button type="button" aria-expanded="false">%02d. %s<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="a"><p>%s %s</p></div></div>' % (i + 1, e(g[1]), e(g[2]), e('The Homworks standard: ' + g[5])) for i, g in enumerate(GD)))
body += cta('Quality you can see. <em>Care you can count on.</em>', 'Call for a free design and see how the Homworks process feels different.')
add('why-homworks', 'Why Choose Homworks | 100+ Quality Checks, 10-Year Warranty', 'Why homeowners choose Homworks: every material checked, an own factory, a 30-day delivery promise* and a 10-year warranty. Plus 16 questions to ask any designer.',
    body, 'why-homworks.html', gd_qas(), crumbs=[HOME, ('Why Homworks', 'why-homworks.html')], og='assets/home5/why-hero.webp')

# --- about
body = hero([HOME, ('Why Homworks', 'why-homworks.html'), ('About Us', None)], 'About Homworks', 'Thoughtful home interiors, <em>crafted for India.</em>',
            'Homworks (Stylcove Modulars Pvt Ltd) designs, manufactures and installs home interiors, engineered in our own Coimbatore factory and built for longevity.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('Find a centre', 'locations.html', 'line')],
            [('6', 'cities'), ('1', 'own factory'), ('10 years', 'warranty')],
            'assets/home5/why-photo.webp', 'A Homworks craftsperson at work in the factory', pill='Made in Coimbatore')
body += answer('Who is Homworks?', 'Homworks is a home interiors company that designs, manufactures and installs furniture and interiors for the way India lives now.',
               'Interiors are engineered in Homworks’ own Coimbatore factory and fitted at your home by the Homworks team. Homworks operates as Stylcove Modulars Pvt Ltd, with centres in six cities.')
body += section(sh('What we believe', 'Four things <em>we hold to.</em>') + grid('g2', [
    flat('01', 'Design-led, always', 'Every project starts with a conversation about how you live.'),
    flat('02', 'In-house, end to end', 'Design, manufacturing and installation under one accountable team.'),
    flat('03', 'Checked, so you don’t have to', 'Every raw material meets a rigorous quality control mandate before it reaches your home.'),
    flat('04', 'Built to last', 'A 10-year warranty and an after-sales service to stand behind the work.')]))
body += section(split('assets/home/factory-cnc.jpg', 'CNC machining at the Homworks factory in Coimbatore', 'The factory', 'Made in our own <em>Coimbatore factory.</em>',
                      ['Our own manufacturing facility runs CNC and flat-lamination machinery imported from Italy and Germany. Each material is tested twice: when it reaches the factory and when it is issued to a project.'],
                      ['An in-house material testing lab', 'Own installation team', 'Site carpentry kept for fillers, end panels and visible panels'], links=[('Quality & factory', 'quality-factory.html', 'line')]), 'alt')
body += section(sh('Where we are', 'Six cities, <em>one standard.</em>') + grid('g3', [card('location-%s.html' % c['slug'], 'assets/home5/work-%d.webp' % (i % 4 + 1), 'Homework interior from the %s centre' % c['name'], c['tag'], c['name'], CITY_BLURB[c['slug']], 'Visit this centre') for i, c in enumerate(CITIES)]))
body += cta('Come see <em>how we build.</em>', 'Call for a free design and meet a Homworks designer.')
add('about-us', 'About Homworks | Home Interiors Made in Coimbatore', 'Homworks (Stylcove Modulars Pvt Ltd) designs, manufactures and installs home interiors in its own Coimbatore factory, with centres in six cities.',
    body, 'why-homworks.html', None, crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('About Us', 'about-us.html')], og='assets/home5/why-photo.webp', typ='AboutPage')

# --- how it works
HOW = [('Get', ['Meet your designer', 'Requirement gathering', 'Initial design', 'Booking advance', 'Site measurement']),
       ('Set', ['3D model + Quality check', 'Design freeze', 'BOM + Production drawings', 'Site validation', 'Final sign-off']),
       ('Go', ['Execution begins', 'Factory production', 'Site readiness', 'Dispatch & delivery', 'Installation, QC, Handover'])]
body = hero([HOME, ('Why Homworks', 'why-homworks.html'), ('How It Works', None)], 'How it works', 'The seamless <em>Homworks process</em>',
            'A clear step-by-step path to a beautifully designed home.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('The 30-day promise', '30-day-delivery.html', 'line')],
            [('3', 'stages: Get, Set, Go'), ('15', 'clear steps'), ('30', 'days from sign-off*')],
            'assets/home5/stage-main.webp', 'A designer reviewing a floor plan with a client', pill='Get · Set · Go')
body += answer('How does Homworks work?', 'Homworks works in three stages – Get, Set and Go – covering 15 steps from meeting your designer to installation, quality check and handover.',
               'Consult by video call or visit an experience centre, share your ideas and preferences, approve your 3D design, and your interiors are made in our factory and installed by our team.')
body += section(sh('Three stages', 'From first meeting <em>to handover.</em>') + steps3())
tl = ''.join('<li class="rv"><span class="d">%02d</span><div><h3>%s</h3><p>%s</p></div></li>' % (i + 1, e(a), e(b)) for i, (a, b) in enumerate([
    ('Meet your designer', 'Consult by video call or visit an experience centre. Share your ideas, needs, and design preferences.'),
    ('Initial design and booking', 'Explore styles and get answers from design experts. Then book with an advance and your designer measures the site.'),
    ('3D model and design freeze', 'Approve your 3D design and fixed quote. That is Day 0 of your 30 days.*'),
    ('BOM and production drawings', 'Production drawings and bill of materials are prepared, and the site is validated before production begins.'),
    ('Factory production', 'Your modules move into our own factory – not a third-party workshop.'),
    ('Dispatch, installation and handover', 'Our own installation team fits your home, with a 100+ point quality check before final handover. Your 10-year warranty begins at handover.')]))
body += section(sh('In detail', 'What happens, <em>and when.</em>') + '<ol class="tl">%s</ol><p class="note">%s</p>' % (tl, e(FOOT30)), 'alt')
body += section(faq_block('Process <em>questions</em>', 'Questions', F('start', 'time', 'changes', 'factory')))
body += cta('Ready for <em>step one?</em>', 'Call for a free design – a Homworks designer calls you within 24 hours.')
howto = {'@context': 'https://schema.org', '@type': 'HowTo', 'name': 'How Homworks designs and delivers your interiors', 'step': [
    {'@type': 'HowToSection', 'name': w, 'itemListElement': [{'@type': 'HowToStep', 'name': s, 'text': s} for s in it]} for w, it in HOW]}
add('how-it-works', 'How Homworks Works: Get, Set, Go | Interior Process', 'The Homworks process in three stages and 15 steps: meet your designer, approve your 3D design, and move in after factory production and installation.',
    body, 'why-homworks.html', F('start', 'time', 'changes', 'factory'), extra_ld=[howto], crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('How It Works', 'how-it-works.html')], og='assets/home5/stage-main.webp')

# --- 30 day
body = hero([HOME, ('Why Homworks', 'why-homworks.html'), ('30-Day Delivery', None)], 'The 30-day promise', 'Flawless design at <em>matchless speed.</em>',
            'Perfect interiors done in just 30 days. Or it’s free*',
            [('Call for a FREE design**', 'contact.html', 'solid'), ('How it works', 'how-it-works.html', 'line')],
            [('30', 'working days'), ('Day 0', 'is your design sign-off'), ('+10', 'days for NE India and out-of-inventory finishes')],
            'assets/home5/step-2.webp', 'A couple approving a 3D design and quote with Homworks', pill='Day 0: sign-off',
            glass=('The clock starts when', ['You approve your 3D design', 'You approve your fixed quote', 'Your modules enter our factory']))
body += answer('How long does Homworks take?', 'Homworks finishes your interiors in just 30 working days from design sign-off, or it’s free*.',
               'Day 0 is the day you approve your 3D design and fixed quote. ' + FOOT30[2:])
body += section(sh('Day by day', 'What starts the clock, <em>and what stops it.</em>') + split('assets/home5/step-3.webp', 'A couple receiving the keys to their new home', 'The terms, in plain words', 'Clear terms, <em>no fine print.</em>',
                ['The 30 days count from sign-off, not from your first phone call.', FOOT30],
                ['<b>Starts</b> – when you approve your 3D design and fixed quote.', '<b>Excluded</b> – client-side delays, design changes and site readiness.', '<b>Adds 10 days</b> – North East India and out-of-inventory finishes.', '<b>Ends</b> – handover on Day 30, when your 10-year warranty begins.']))
body += section(sh('Where the days go', 'Get. Set. <em>Go.</em>') + steps3(), 'alt')
body += section(faq_block('Delivery <em>questions</em>', 'Questions', F('time', 'changes', 'factory', 'warranty')))
body += '<div class="wrap"><p class="note">%s &nbsp; ** For one room only.</p></div>' % e(FOOT30)
body += cta('Let’s get you <em>home on time.</em>', 'Call for a free design** – for one room only.')
add('30-day-delivery', 'The 30-Day Interior Delivery Promise | Homworks', 'Homworks delivers perfect interiors in just 30 working days from design sign-off, or it’s free*. See what starts the clock and the exact terms.',
    body, 'why-homworks.html', F('time', 'changes', 'factory', 'warranty'), crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('30-Day Delivery', '30-day-delivery.html')], og='assets/home5/step-2.webp')

# --- quality & factory
CERT = [('isi', 'BIS ISI MARK', 'Licences IS 17634 & IS 17635'), ('gicg', 'ISO 9001:2015', 'Quality Management · GICG'), ('gicg', 'ISO 14001:2015', 'Environmental Management · GICG'),
        ('gicg', 'ISO 45001:2018', 'Health & Safety · GICG'), ('rehau', 'REHAU', 'ISO 9001 & 14001 certified edge band'), ('tuv', 'TÜV RHEINLAND', 'RoHS test report: PASS'),
        ('technomelt', 'TECHNOMELT PUR', 'Henkel hot-melt adhesives'), ('fasto', 'FASTO REDISIL', 'Silicone sealants')]
rows = ''.join('<tr><td>%s</td><td>%s</td><td>%s</td></tr>' % (e(g[1]), e(g[3] if False else g[2]), e(g[5])) for g in GD[:8])
body = hero([HOME, ('Why Homworks', 'why-homworks.html'), ('Quality & Factory', None)], 'Quality & factory', 'Rigorous quality, <em>from raw material to handover.</em>',
            'We subject every raw material to a rigorous quality control mandate before it reaches your home.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('Warranty', 'warranty-after-sales.html', 'line')],
            [('100+', 'point quality check'), ('2×', 'material testing'), ('10 years', 'warranty')],
            'assets/home/factory-cnc.jpg', 'CNC machine drilling a board in the Homworks factory', pill='In-house testing lab',
            glass=('Tested twice', ['When it reaches the factory', 'When it is issued to a project', 'Tested samples available']))
body += answer('Quality at Homworks', 'Homworks tests every material twice – on arrival at the factory and again when it is issued to a project – in an in-house testing lab, and runs a 100+ point quality check before handover.',
               'Core boards are ISI-certified BWP / HDHMR E0, edges are PUR hot-melt banded, and hardware, joints, finishes and load are tested.')
body += band([('72 hrs', 'boiling-water test on every BWP-grade plywood'), ('E0', 'grade core boards, with no formaldehyde'), ('80° C', 'heat the PUR edge-banding withstands'), ('18 mm', 'gap kept between the wall and the carcass')])
body += section(sh('The 16 checks', 'What we test, <em>and how.</em>', 'Each point from the Homworks Interior Guide, with the standard we hold ourselves to.') +
                '<div class="tw rv"><table><thead><tr><th>Check</th><th>Why it matters</th><th>The Homworks standard</th></tr></thead><tbody>%s</tbody></table></div>' % rows +
                '<div class="faqw" style="grid-template-columns:1fr;margin-top:26px"><div class="rv">%s</div></div>' % ''.join(
                    '<div class="qa"><button type="button" aria-expanded="false">%02d. %s<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="a"><p>%s %s</p></div></div>' % (i + 9, e(g[1]), e(g[2]), e('The Homworks standard: ' + g[5])) for i, g in enumerate(GD[8:])), 'alt')
body += section(sh('Certified', 'Certificates and <em>test records.</em>', 'A claim about quality is only as good as the record behind it.') + '<ul class="certs">%s</ul>' % ''.join(
    '<li class="rv">%s<b>%s</b><span>%s</span></li>' % (img('assets/home5/cert/%s.webp' % k, t + ' logo'), e(t), e(s)) for k, t, s in CERT))
body += cta('See the standard <em>for yourself.</em>', 'Call for a free design, and ask for a tested sample of the core materials.')
add('quality-factory', 'Quality & Factory: ISI Boards, 72-Hour Boil Test | Homworks', 'Inside the Homworks factory: ISI-certified BWP / HDHMR E0 boards, 72-hour boiling test, PUR edge-banding, an in-house testing lab and a 100+ point quality check.',
    body, 'why-homworks.html', [(g[6].strip('“”"'), 'The Homworks standard: ' + g[5]) for g in GD], crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('Quality & Factory', 'quality-factory.html')], og='assets/home/factory-cnc.jpg')

# --- warranty
body = hero([HOME, ('Why Homworks', 'why-homworks.html'), ('Warranty & After-Sales', None)], 'Warranty & after-sales', 'A 10-year warranty, <em>real after-sales.</em>',
            'Every project is backed by our warranty and prompt after-sales service.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('Contact us', 'contact.html', 'line')],
            [('10 years', 'warranty on every project'), ('Day 30', 'warranty begins at handover'), ('1800 833 4500', 'toll-free')],
            'assets/home5/step-3.webp', 'A family receiving the keys to their new Homworks home', pill='Handover on Day 30',
            glass=('Covered for 10 years', ['Cabinetry', 'Carcass', 'Mechanisms']))
body += answer('What is Homworks’ warranty?', 'Every Homworks project carries a 10-year warranty on cabinetry, carcass and mechanisms, starting at handover.',
               'A dedicated after-sales team supports anything that needs a visit. Ask your designer for the written terms before you sign off.')
body += section(sh('What backs the warranty', 'Built so the warranty <em>rarely matters.</em>') + grid('g3', [
    flat('01', 'Tested boards', 'ISI-certified BWP / HDHMR E0 core boards in every carcass.'),
    flat('02', 'Tested hardware and joints', 'A drawer and shutter cycle test for runners and hinges, and a compression test for the dowel.'),
    flat('03', 'Double-carcass boxes', 'A single unit can be replaced easily without disturbing the other cabinets.')]))
body += section(faq_block('Warranty <em>questions</em>', 'Questions', F('warranty', 'board', 'wet', 'start')), 'alt')
body += cta('Need help <em>with something?</em>', 'Call us toll-free or write to us – the Homworks team will follow up.')
add('warranty-after-sales', '10-Year Warranty & After-Sales Service | Homworks', 'Every Homworks project carries a 10-year warranty on cabinetry, carcass and mechanisms, with a dedicated after-sales team.',
    body, 'why-homworks.html', F('warranty', 'board', 'wet', 'start'), crumbs=[HOME, ('Why Homworks', 'why-homworks.html'), ('Warranty & After-Sales', 'warranty-after-sales.html')], og='assets/home5/step-3.webp')

# --- projects
WORKS = [('work-1', 'Contemporary Indian Living', 'Indiranagar, Bengaluru'), ('work-2', 'The Modern Family Lounge', 'Adyar, Chennai'),
         ('work-3', 'Modern Living, Refined', 'Jubilee Hills, Hyderabad'), ('work-4', 'The Urban Indian Home', 'Adyar, Chennai')]
body = hero([HOME, ('Projects', None)], 'Completed works', 'Bespoke homes <em>crafted from the ground up</em>',
            'A look at homes designed, made and installed by Homworks.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('Browse by room', 'interiors.html', 'line')],
            [('14,000+', 'happy homes'), ('6', 'cities'), ('10 years', 'warranty')],
            'assets/home5/work-1.webp', 'Contemporary Indian living room and kitchen by Homworks', pill='Featured works')
body += section(sh('Featured works', 'Homes that <em>work beautifully.</em>', 'Each home is designed around the people who live in it, then made in our factory and fitted by our team.') + grid('g2', [
    card(None, 'assets/home5/%s.webp' % w[0], w[1] + ', ' + w[2], w[2], w[1], 'Designed, made and installed by Homworks.') for w in WORKS]))
body += section(sh('Find your room', 'Start with the room <em>that matters most.</em>') + grid('g3', hub_cards()[:3]), 'alt')
body += cta('Let’s build <em>yours next.</em>', 'Call for a free design and meet a Homworks designer within 24 hours.')
add('projects', 'Completed Homes & Featured Works | Homworks', 'Featured Homworks homes in Bengaluru, Chennai and Hyderabad – bespoke interiors designed, made in our factory and installed by our own team.',
    body, 'projects.html', None, crumbs=[HOME, ('Projects', 'projects.html')], og='assets/home5/work-1.webp', typ='CollectionPage')

# --- locations hub
body = hero([HOME, ('Location', None)], 'Locations', 'A Homworks centre <em>near you.</em>',
            'Meet a designer and see Homworks interiors at one of our six centres.',
            [('Call %s' % PHONE, 'tel:' + PHONE_TEL, 'solid'), ('Book a FREE consultation', 'contact.html', 'line')],
            [('6', 'cities'), ('1', 'factory, in Coimbatore'), ('10 years', 'warranty everywhere')],
            'assets/home5/card-2.webp', 'A finished Homworks interior', pill='Six centres')
body += answer('Where is Homworks?', 'Homworks has centres in Coimbatore, Chennai, Bangalore, Erode, Hyderabad and Guwahati.',
               'The Homworks factory and corporate office are in Peelamedu, Coimbatore. Call 1800 833 4500 to reach any centre.')
body += section(sh('Our centres', 'Six cities, <em>one standard.</em>') + grid('g3', [
    card('location-%s.html' % c['slug'], 'assets/home5/work-%d.webp' % (i % 4 + 1), 'Homworks interior, %s' % c['name'], c['tag'], c['name'], c['address'], 'Centre details') for i, c in enumerate(CITIES)]))
body += section(faq_block('Location <em>questions</em>', 'Questions', F('cities', 'start', 'factory', 'time')), 'alt')
body += cta('Find your nearest <em>Homworks team.</em>', 'Call for a free design and we will connect you to your city centre.')
ORG_LOCS = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': 'Homworks centres', 'itemListElement': [
    {'@type': 'ListItem', 'position': i + 1, 'name': 'Homworks ' + c['name'], 'url': '%s/location-%s.html' % (SITE, c['slug'])} for i, c in enumerate(CITIES)]}
add('locations', 'Homworks Centres: Coimbatore, Chennai, Bangalore, Erode, Hyderabad, Guwahati', 'Find a Homworks interior design centre in Coimbatore, Chennai, Bangalore, Erode, Hyderabad or Guwahati. Addresses and toll-free number.',
    body, 'locations.html', F('cities', 'start', 'factory', 'time'), extra_ld=[ORG_LOCS], crumbs=[HOME, ('Location', 'locations.html')], typ='CollectionPage')

# --- city pages
for i, c in enumerate(CITIES):
    st, loc, reg, pin = STREET[c['slug']]
    maps = 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(c['address'])
    qas = [('Where is the Homworks %s centre?' % c['name'], 'The Homworks %s centre (%s) is at %s.' % (c['name'], c['tag'].replace('·', '–'), c['address'])),
           ('Does Homworks do interiors in %s?' % c['name'], 'Yes. Homworks designs, manufactures and installs home interiors in %s, with a 30-day delivery promise* from design sign-off and a 10-year warranty.' % c['name']),
           FAQ['start'], FAQ['time']]
    body = hero([HOME, ('Location', 'locations.html'), (c['name'], None)], 'Homworks ' + c['name'], 'Interiors in <em>%s.</em>' % c['name'], CITY_BLURB[c['slug']],
                [('Call %s' % PHONE, 'tel:' + PHONE_TEL, 'solid'), ('Get directions', maps, 'line')],
                [('30', 'days from sign-off*'), ('10 years', 'warranty'), ('1', 'accountable team')],
                'assets/home5/work-%d.webp' % (i % 4 + 1), 'A Homworks interior for homes in %s' % c['name'], pill=c['tag'],
                glass=('Visit the centre', [c['addrShort'] if False else st, '%s – %s' % (loc, pin), PHONE]))
    body += answer('Homworks in %s' % c['name'], 'Homworks designs, manufactures and installs home interiors in %s, from its %s.' % (c['name'], c['tag'].replace('·', '–')),
                   'Address: %s. Call %s to book a free consultation.' % (c['address'], PHONE))
    body += section(sh('What you can expect', 'The full Homworks process, <em>in %s.</em>' % c['name']) + grid('g3', [
        flat('01', 'Meet a designer', 'Consult by video call or visit an experience centre; a designer calls you within 24 hours.'),
        flat('02', 'See it in 3D', 'Approve a 3D design and fixed quote. That is Day 0 of your 30 days.*'),
        flat('03', 'Made and fitted by us', 'Factory production in Coimbatore, then installation by our own team and a 10-year warranty.')]))
    body += section('<div class="contact"><div class="rv"><p class="eyebrow">Visit us</p><h2 class="h2">%s <em>centre</em></h2><ul class="cl" style="margin-top:24px">'
                    '<li><b>Address</b><span>%s</span></li><li><b>Phone</b><span><a href="tel:%s">%s</a></span></li><li><b>Email</b><span><a href="mailto:%s">%s</a></span></li></ul>'
                    '<div class="btns"><a class="btn solid" href="%s" target="_blank" rel="noopener">Open in Maps%s</a></div></div>'
                    '<figure class="rv d1 split" style="display:block;margin:0"><div style="border-radius:22px;overflow:hidden;aspect-ratio:4/3.2">%s</div></figure></div>' % (
                        e(c['name']), e(c['address']), PHONE_TEL, PHONE, EMAIL, EMAIL, maps, ARROW, img('assets/home5/work-%d.webp' % (i % 4 + 1), 'Homworks interior')), 'alt')
    body += section(faq_block('%s <em>questions</em>' % c['name'], 'Questions', qas))
    body += cta('Plan your home <em>in %s.</em>' % c['name'], 'Call for a free design and meet a Homworks designer within 24 hours.')
    lb = dict(ORG); lb.update({'@id': '%s/location-%s.html#centre' % (SITE, c['slug']), 'name': 'Homworks ' + c['name'], 'url': '%s/location-%s.html' % (SITE, c['slug']),
                               'address': {'@type': 'PostalAddress', 'streetAddress': st, 'addressLocality': loc, 'addressRegion': reg, 'postalCode': pin, 'addressCountry': 'IN'},
                               'areaServed': c['name'], 'parentOrganization': {'@id': SITE + '/#org'}})
    lb.pop('@context')
    add('location-' + c['slug'], 'Interior Designers in %s | Homworks %s' % (c['name'], c['tag'].split('·')[0].strip() if '·' in c['tag'] else c['tag']),
        'Homworks %s centre: home interiors designed, made and installed with a 30-day promise* and 10-year warranty. Address, phone and directions.' % c['name'],
        body, 'locations.html', qas, extra_ld=[dict({'@context': 'https://schema.org'}, **lb)], crumbs=[HOME, ('Location', 'locations.html'), (c['name'], 'location-%s.html' % c['slug'])], og='assets/home5/work-%d.webp' % (i % 4 + 1))

# --- FAQs
faq_groups = [('The basics', [FAQ['cost'], FAQ['time'], FAQ['start'], FAQ['cities']]),
              ('Factory and installation', [FAQ_FULL['sawdust'], FAQ_FULL['whyoff'], FAQ_FULL['install'], FAQ_FULL['custom'], FAQ_FULL['dust'], FAQ['factory']]),
              ('Materials and finishes', [FAQ['board'], FAQ['wet'], FAQ['finish']]),
              ('Changes and warranty', [FAQ['changes'], FAQ['warranty']])]
allq = [q for _, g in faq_groups for q in g]
body = hero([HOME, ('FAQs', None)], 'FAQs', 'You’ve got questions? <em>We’ve got answers.</em>',
            'Straight answers on cost, timelines, materials, installation and warranty.',
            [('Call for a FREE design', 'contact.html', 'solid'), ('The 16 key questions', 'why-homworks.html#questions', 'line')],
            [('30', 'days from sign-off*'), ('10 years', 'warranty'), ('24 hrs', 'to your first call')],
            'assets/home5/faq-desk.webp', 'A fluted wooden sideboard styled with a vase and bowl', pill='Factory-built, home-fitted')
body += section(faq_block('Everything <em>you need to ask.</em>', 'Answers', None, groups=faq_groups))
body += '<div class="wrap"><p class="note">%s</p></div>' % e(FOOT30)
body += cta('Still have <em>a question?</em>', 'Call us toll-free or book a free consultation.')
add('faqs', 'FAQs: Cost, Timeline, Materials & Warranty | Homworks', 'Answers to common questions about Homworks interiors: cost, the 30-day timeline, factory-made furniture, boards, finishes, installation and warranty.',
    body, 'faqs.html', allq, crumbs=[HOME, ('FAQs', 'faqs.html')], og='assets/home5/faq-desk.webp')

# --- contact
opts = ''.join('<option>%s</option>' % c['name'] for c in CITIES) + '<option>Other city</option>'
needs = ''.join('<option>%s</option>' % n for n in ['Full home interiors', 'Modular kitchen', 'Wardrobes', 'Living room', 'Bedroom', 'Renovation'])
body = hero([HOME, ('Contact', None)], 'Contact', 'Make room for <em>finer living.</em>', 'Beautiful homes begin with Homworks. Tell us about your home and a designer will call you within 24 hours.',
            [('Call %s' % PHONE, 'tel:' + PHONE_TEL, 'solid'), ('Email us', 'mailto:' + EMAIL, 'line')],
            [('24 hrs', 'we call you back'), ('6', 'cities'), ('Free', 'design consultation')],
            'assets/home5/cta7-bg.webp', 'A warm Homworks living room', pill='Call for a free design')
body += section('<div class="contact"><form class="formcard rv" id="leadForm" novalidate><h2>Tell us a little about your home</h2><p class="fs">Our Homworks designer will call you within 24 hours to arrange your complimentary consultation.</p>'
                '<input required name="name" placeholder="Your full name" autocomplete="name" aria-label="Your full name"><div class="row"><input required type="tel" name="phone" placeholder="Phone number" autocomplete="tel" aria-label="Phone number"><input required type="email" name="email" placeholder="Email address" autocomplete="email" aria-label="Email address"></div>'
                '<select name="city" aria-label="Select your city"><option value="">Select your city</option>%s</select><select name="need" aria-label="What are you planning?"><option value="">What are you planning?</option>%s</select>'
                '<button class="btn pink" type="submit">Book my free consultation</button><p class="note">By submitting, you agree to receive a call or WhatsApp from Homworks about your project. We respect your privacy.</p>'
                '<div class="ok" id="ok" role="status">Your consultation request is in. We will be in touch very soon.</div></form>'
                '<ul class="cl rv d1"><li><b>Call us</b><span><a href="tel:%s">%s</a> (toll-free)</span></li><li><b>Email</b><span><a href="mailto:%s">%s</a></span></li><li><b>Coimbatore office</b><span>%s</span></li>'
                '<li><b>Other centres</b><span>%s</span></li></ul></div>' % (opts, needs, PHONE_TEL, PHONE, EMAIL, EMAIL, CITIES[0]['address'],
                ' · '.join('<a href="location-%s.html">%s</a>' % (c['slug'], c['name']) for c in CITIES[1:])))
body += section(faq_block('Before you <em>call</em>', 'Questions', F('start', 'time', 'cost', 'cities')), 'alt')
add('contact', 'Contact Homworks | Book a Free Design Consultation', 'Contact Homworks: call 1800 833 4500, email enquiry@homworks.com or book a free design consultation. A designer calls within 24 hours.',
    body, 'contact.html', F('start', 'time', 'cost', 'cities'), crumbs=[HOME, ('Contact', 'contact.html')], og='assets/home5/cta7-bg.webp', typ='ContactPage')


# ------------------------------------------------------------------ write
def page_html(slug, p):
    url = SITE + '/' + slug + '.html'
    lds = [ORG, crumbs_ld(p['crumbs'])] if p['crumbs'] else [ORG]
    if p['faq']:
        lds.append(faq_ld(p['faq']))
    lds += p['extra']
    lds.append({'@context': 'https://schema.org', '@type': p['typ'], 'name': p['title'], 'description': p['desc'], 'url': url, 'isPartOf': {'@id': SITE + '/#org'}})
    head = '''<!doctype html>
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
  <link rel="stylesheet" href="assets/home5.css?v=r19"><link rel="stylesheet" href="assets/inner.css?v=r1">
  %s
</head>
<body class="inner">
%s
<main id="top">
%s
</main>
%s
<script src="assets/inner.js?v=r1"></script>
</body>
</html>
''' % (e(p['title']), e(p['desc']), url, e(p['title']), e(p['desc']), url, SITE, p['og'], '\n  '.join(ld(x) for x in lds), header_html(p['active']), p['body'], footer_html())
    return head


for slug, p in PAGES.items():
    open(os.path.join(ROOT, slug + '.html'), 'w', encoding='utf-8').write(page_html(slug, p))

# sitemap + robots (the homepage is included; legacy pages that were not rebuilt are left out)
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
    h = re.sub(r'<header class="nav" id="nav">.*?</nav>\s*<nav class="mnav".*?</nav>', lambda m: header_html(''), h, count=1, flags=re.S)
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
    if '/*LIVE*/' in s2:
        s2 = re.sub(r'/\*LIVE\*/.*?/\*/LIVE\*/', lambda m: live_js, s2, flags=re.S)
    else:
        m = re.search(r"  var SUBPAGES=false;\n  function lk\(u\)\{[^\n]*\}\n  \$\$\('a\[data-href\]'\)[^\n]*\n", s2)
        s2 = s2.replace(m.group(0), '  ' + live_js + '\n', 1)
    open(j, 'w', encoding='utf-8').write(s2)


patch_home()
print('homepage patched')
