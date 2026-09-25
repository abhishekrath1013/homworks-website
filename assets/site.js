/* ===== Homworks shared site engine ===== */
const $=(s,c)=>(c||document).querySelector(s);
const $$=(s,c)=>[...(c||document).querySelectorAll(s)];
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
const AV_COLORS=['#2aaeb3','#E3929E','#16555a','#c9a15b','#8a5a63','#5b6b3a'];
function avatarColor(seed){let h=0;for(let i=0;i<seed.length;i++)h=seed.charCodeAt(i)+((h<<5)-h);return AV_COLORS[Math.abs(h)%AV_COLORS.length]}
function initials(name){return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()}

const ART={kitchen:['#c9707d','#f3dadd'],living:['#16555a','#2aaeb3'],bedroom:['#0e3336','#2c4a4d'],wardrobe:['#8a5a63','#f3dadd'],pooja:['#a9782e','#f1e4c9'],tv:['#0e3336','#16555a'],storage:['#7F7E7F','#e5e5e4'],villa:['#16555a','#0a2224'],design:['#E3929E','#2aaeb3'],city:['#0e3336','#16555a'],blog:['#2aaeb3','#16555a'],process:['#c9a15b','#16555a'],care:['#2aaeb3','#8a5a63'],studio:['#5b6b3a','#a9c47a'],team:['#8a5a34','#c9a15b']};

// One real, licensed video + poster per content category — reused across
// every hero and every [data-art] card that shares that category, the same
// way the old flat-gradient ART map was reused. See assets/hero-videos/.
// `poster`/`video` are document-relative, for plain HTML src/poster attrs.
// `cssPoster` is relative to assets/site.css instead — CSS custom properties
// resolve a relative url() against the stylesheet that *consumes* the var(),
// not the context that declared it, so an inline --image set from here must
// already be stylesheet-relative or it 404s one directory too deep.
function heroMedia(key){return {video:`assets/hero-videos/${key}.mp4`,poster:`assets/hero-videos/${key}.jpg`,cssPoster:`hero-videos/${key}.jpg`}}
const HERO_MEDIA={};
Object.keys(ART).forEach(k=>HERO_MEDIA[k]=heroMedia(k));

const DEFAULT_ROOMS=['Full home interiors','Modular kitchen','Living room','Bedroom','Wardrobes','TV unit','Pooja & foyer unit'];

const CITIES=[
 {slug:'coimbatore',name:'Coimbatore',tag:'Corporate Office · HQ',address:'538/2, Airport Service Rd, Peelamedu, Alagu Nagar, Civil Aerodrome Post, Coimbatore – 641014',addrShort:'538/2, Airport Service Rd, Peelamedu, Coimbatore – 641014',homes:'4,800+',since:'2012',days:'32 days',blurb:"Home to the Homworks factory and design studio — every module made in-house starts here, whichever city it ships to."},
 {slug:'chennai',name:'Chennai',tag:'Kovilambakkam Centre',address:'Plot No: 492, 200 Feet Radial Road, Indirajit Avenue Kovilambakkam, Chennai – 600 117',addrShort:'Plot 492, 200 Feet Radial Road, Kovilambakkam, Chennai – 600 117',homes:'3,100+',since:'2016',days:'30 days',blurb:"A fast-growing metro team serving apartments across OMR, Kovilambakkam and the wider Chennai suburbs."},
 {slug:'bangalore',name:'Bangalore',tag:'Banashankari Centre',address:'#37/5 (New Pid No.6), 13th Cross, 30th Main, Banashankari 2nd Stage, Bengaluru – 560070',addrShort:'#37/5, 13th Cross, 30th Main, Banashankari 2nd Stage – 560070',homes:'2,600+',since:'2018',days:'34 days',blurb:"Built for Bangalore's apartment-first families — compact-footprint modular design is our specialty here."},
 {slug:'erode',name:'Erode',tag:'Perundurai Road Centre',address:'108/1, Perundurai Road, Near Ambal Autos, Kumalan Kuttai, Erode – 638 011',addrShort:'108/1, Perundurai Road, Kumalan Kuttai, Erode – 638 011',homes:'1,900+',since:'2014',days:'28 days',blurb:"One of our earliest centres outside Coimbatore, close enough to the factory for some of our fastest deliveries."},
 {slug:'hyderabad',name:'Hyderabad',tag:'Shamshabad Centre',address:'ABC Spacery, Opp. Mayfair Convention Center, Shamshabad, Hyderabad, Telangana 501218',addrShort:'ABC Spacery, Opp. Mayfair Convention Center, Shamshabad – 501218',homes:'420+',since:'2024',days:'36 days',blurb:"Our newest south-of-the-river centre, bringing the full in-house Homworks process to Hyderabad."},
 {slug:'guwahati',name:'Guwahati',tag:'Lalmati Centre',address:'R K Metals, NH37, Opp. Nidhi Bhavan, Lalmati Near AEE Tower, Guwahati, Assam – 781029',addrShort:'R K Metals, NH37, Lalmati, Near AEE Tower, Guwahati – 781029',homes:'260+',since:'2025',days:'38 days',blurb:"Homworks' first Northeast centre — the same in-house manufacturing and 10-year warranty, now in Guwahati."}
];
const CITY_NAMES=CITIES.map(c=>c.name);

const KITCHEN_LAYOUTS=[
 {slug:'l-shaped',name:'L-Shaped',h1:'The L-shaped kitchen,<br>done right.',blurb:"Two adjoining walls meet at a corner to free up the centre of the room — the most requested layout for Indian homes because it works in almost any footprint.",bestFor:'2–3BHK homes',footprint:'70–110 sqft',pros:[
  {t:'Shorter walk, less waiting',b:'A tight work triangle between hob, sink and fridge means less walking for the same amount of cooking.'},
  {t:'The centre stays open',b:"No cabinetry runs through the middle of the room — ideal if you want a breakfast table or open floor."},
  {t:'Scales with your home',b:'Works as a compact corner kitchen or a full family kitchen, in the same basic shape.'},
  {t:'Easiest to ventilate',b:'A single uninterrupted wall makes it simple to plan a window and chimney together.'}]},
 {slug:'u-shaped',name:'U-Shaped',h1:'Three walls of worktop.<br>Zero wasted reach.',blurb:"Three connected walls of cabinetry give you the most storage and counter space of any layout — built for households that cook often, and together.",bestFor:'Large families',footprint:'110–160 sqft',pros:[
  {t:'Maximum storage',b:'Three connected walls give more counter and cabinet length than any other layout of the same room size.'},
  {t:'A dedicated zone for everything',b:"Prep, cook and clean each get their own wall, so nothing competes for the same counter."},
  {t:'A room of its own',b:"Naturally closes the kitchen off from the rest of the home — useful for Indian cooking and its aromas."},
  {t:'Room for two cooks',b:"Wide enough for two people to work at once without getting in each other's way."}]},
 {slug:'galley',name:'Galley',h1:'Two parallel walls.<br>Nothing extra.',blurb:"Worktops face each other across a single walkway — the fastest layout to cook in, and the smartest use of a narrow room.",bestFor:'Compact apartments',footprint:'45–75 sqft',pros:[
  {t:'The fastest kitchen to cook in',b:"Everything sits within arm's reach across a single walkway."},
  {t:'Built for narrow rooms',b:'Makes full use of rooms as tight as 6–8 ft wide, where other layouts would not fit.'},
  {t:'Nothing is ever far away',b:'Hob, sink and storage all sit on one of two facing walls.'},
  {t:'The most cost-efficient shape',b:'Least cabinetry required for the storage you actually get.'}]},
 {slug:'one-wall',name:'One-Wall',h1:'One clean wall.<br>An open home.',blurb:"Every function lines up along a single wall — the layout of choice for studios and homes that want the kitchen to open into the living room.",bestFor:'Studios & 1BHKs',footprint:'35–55 sqft',pros:[
  {t:'Keeps the room open',b:'Everything lines up on one wall, leaving the rest of the space free for living.'},
  {t:'The simplest install',b:'One run of plumbing and electrical keeps installation fast and predictable.'},
  {t:'Pairs well with an island',b:'Add a freestanding counter later without disturbing the working wall.'},
  {t:'Our most affordable modular layout',b:'Fewer cabinet runs mean a lower starting cost without cutting corners on quality.'}]},
 {slug:'peninsular',name:'Peninsular',h1:'An L-shape,<br>with a landing.',blurb:"An L-shaped layout extended with a connected peninsula — extra counter and seating without the floor space a full island needs.",bestFor:'Open-plan 3BHKs',footprint:'90–130 sqft',pros:[
  {t:'A built-in breakfast counter',b:'Get extra seating without giving up floor area the way a full island would.'},
  {t:'A natural screen',b:'The peninsula visually separates the kitchen from an open-plan living room.'},
  {t:'Extra landing space',b:'A dedicated counter for serving food and setting down groceries.'},
  {t:'Great for homes that entertain',b:'Guests can sit at the counter while you cook, instead of standing in the doorway.'}]},
 {slug:'island',name:'Island',h1:'Room to gather,<br>right in the kitchen.',blurb:"A freestanding counter sits at the heart of the room — for larger homes that want the kitchen to be where everyone ends up.",bestFor:'Villas & 4BHK+',footprint:'150+ sqft',pros:[
  {t:'A second prep zone',b:'The island can be a chopping station, a breakfast bar, or both.'},
  {t:'The social centre of the home',b:'Turns cooking into something everyone gathers around, not a room apart.'},
  {t:'Flexible by design',b:'Add a hob, a sink or just seating to the island face — your call.'},
  {t:'Built for larger homes',b:'Needs more floor area than other layouts, so it suits villas and bigger 4BHKs best.'}]}
];

const CASE_STUDIES=[
 {slug:'coimbatore-villa',art:'villa',title:'A quiet villa that knows how to celebrate',city:'Coimbatore',homeType:'Independent villa',sqft:'3,200 sq.ft.',brief:"A joint family of five wanted a home that could host fifty people for a festival, and still feel calm on a Tuesday.",days:'118 days',rooms:[{title:'Full home interiors',href:'full-home-interiors.html',art:'villa'},{title:'Island modular kitchen',href:'kitchen-island.html',art:'kitchen'},{title:'Foyer & pooja unit',href:'foyer-pooja-units.html',art:'pooja'}],quote:"They understood not just our Pinterest board, but the way our family actually lives.",name:'Meera & Arjun',role:'Villa, Coimbatore'},
 {slug:'chennai-3bhk',art:'kitchen',title:'A 3BHK that finally fits a young family',city:'Chennai',homeType:'3BHK apartment',sqft:'1,450 sq.ft.',brief:"First-time parents needed storage that could keep up with a toddler, on a fixed, transparent budget.",days:'32 days',rooms:[{title:'L-shaped modular kitchen',href:'kitchen-l-shaped.html',art:'kitchen'},{title:'Living room & TV unit',href:'tv-units.html',art:'tv'},{title:'Kids bedroom & wardrobes',href:'wardrobes.html',art:'wardrobe'}],quote:"Every small concern was answered before it became a problem. That is rare.",name:'Vignesh Kumar',role:'3BHK, Chennai'},
 {slug:'bangalore-apartment',art:'living',title:'A 2BHK rental turned first home',city:'Bangalore',homeType:'2BHK apartment',sqft:'980 sq.ft.',brief:"A couple's first owned home — compact, but designed to never feel it.",days:'29 days',rooms:[{title:'Bedroom & wardrobes',href:'bedrooms.html',art:'bedroom'},{title:'Living room',href:'living-rooms.html',art:'living'},{title:'Foyer unit',href:'foyer-pooja-units.html',art:'pooja'}],quote:"It feels polished, but it also feels like us. We did not know both were possible.",name:'Aditi Shah',role:'2BHK, Bangalore'}
];

const BLOG_CATEGORIES=[
 {slug:'kitchens',name:'Kitchens',art:'kitchen',blurb:'Layouts, finishes and storage ideas for the room where the whole house ends up.'},
 {slug:'bedrooms',name:'Bedrooms',art:'bedroom',blurb:'Wardrobes, restful palettes and layouts for every kind of bedroom.'},
 {slug:'living',name:'Living',art:'living',blurb:'TV walls, seating and lighting ideas for rooms built for gathering.'},
 {slug:'storage',name:'Storage',art:'storage',blurb:'Smart storage for shoes, crockery, linen and everything in between.'},
 {slug:'planning',name:'Planning',art:'process',blurb:'Budgets, timelines and the practical side of a home interiors project.'},
 {slug:'trends',name:'Trends',art:'design',blurb:'What Indian homeowners are asking their designers for right now.'}
];

const BLOG_POSTS=[
 {slug:'l-shaped-kitchen-ideas',cat:'kitchens',title:'7 L-shaped kitchen ideas that make small homes feel bigger',read:'6 min read',art:'kitchen',excerpt:"The L-shaped layout is the most requested kitchen at Homworks — here is how to get the most from one, whatever your budget.",
  body:["The L-shaped layout is the single most requested kitchen at Homworks — and for good reason. Two adjoining walls meet at a corner, which frees up the centre of the room while keeping your hob, sink and fridge within a short, efficient work triangle.",
  "For a lot of Indian homes, especially 2BHK and 3BHK apartments, the L-shape is simply the layout that fits. But ‘fits’ doesn’t have to mean plain — here is how our designers make small L-shaped kitchens feel considerably bigger.",
  "**1. Let the corner do the heavy lifting.** A well-planned corner unit — a carousel or a magic corner pull-out — can recover far more usable storage than a standard blind corner cabinet.",
  "**2. Run cabinetry to the ceiling.** The top third of most kitchens is dead space. Full-height cabinetry, even if the top shelf is for rarely-used items, makes the room look taller and gives you real extra storage.",
  "**3. Keep the colour palette to two tones.** A light base with one accent colour on the tall unit keeps a small kitchen from feeling busy.",
  "**4. Add under-cabinet lighting.** It is a small addition that makes the counter feel considerably larger, especially in kitchens with only one window.",
  "Every L-shaped kitchen we design starts with your floor plan and how you actually cook — not a template. Book a free consultation and your designer will sketch your options in the first session."],
  pull:"The corner is the most wasted square foot in any kitchen — solve it well, and the rest of the room follows."},
 {slug:'30-day-delivery-explained',cat:'planning',title:'What actually happens in your 30-day delivery window',read:'5 min read',art:'process',excerpt:"A day-by-day look at design sign-off, production, installation and handover — and what starts the clock.",
  body:["‘30 days’ sounds simple until you ask what actually starts the clock. Here is what happens, stage by stage, for a qualifying modular interiors project.",
  "**Design sign-off.** The clock starts the day you approve your final 3D design and fixed quote — not the day you first spoke to a designer. Everything before this is exploration, free of charge.",
  "**Production.** Your modules move into our own factory. This is the stage most ‘outsourced’ interior companies cannot promise a date for — because Homworks manufactures in-house, we control this timeline directly.",
  "**Pre-installation checks.** Every module passes through our 100+ point quality check before it ever leaves the factory floor.",
  "**Installation.** Our own installation team — not a third-party contractor — fits your kitchen, wardrobes and units on site, with progress updates at each stage.",
  "**Final quality check & handover.** A final walkthrough with your project manager, a snag list closed out on the spot where possible, and your 10-year warranty activated.",
  "The 30-day promise applies to qualifying modular projects — larger full-home civil works can extend this. Your designer confirms your exact timeline before you sign off on the design."],
  pull:"The clock starts at design sign-off, not the first phone call — so every day counted is a day you can plan around."},
 {slug:'vastu-pooja-room-design',cat:'living',title:'Vastu-aware pooja room design ideas for modern apartments',read:'4 min read',art:'pooja',excerpt:"Give tradition a considered place in a smaller footprint, without it feeling like an afterthought.",
  body:["A pooja space doesn't need a spare room to feel right — it needs the right corner, the right materials, and a little Vastu awareness. Here is how we approach it in apartments where every square foot matters.",
  "**Direction first.** Where possible, we orient the pooja unit so you face east or north while praying — the most commonly preferred orientation in Vastu Shastra. In compact homes, a foyer-adjacent unit often solves this without taking a full room.",
  "**Let it breathe.** A pooja unit with real ventilation, even a small jali panel, keeps diya smoke from settling into fabric and wood elsewhere in the home.",
  "**Materials with meaning.** Teak and sheesham finishes, brass hardware and a marble or stone base are popular for their durability as much as their traditional association.",
  "**Storage that stays tidy.** Dedicated drawers for prasad, diyas and pooja accessories keep the space from becoming a catch-all shelf.",
  "Every foyer and pooja unit at Homworks is designed after understanding your family's specific rituals, not fitted from a catalogue. Ask your designer about Vastu-aware layout options in your free consultation."],
  pull:"Tradition deserves a considered place in a modern floor plan — not an afterthought squeezed into a leftover corner."}
];

const PROJECTS_GALLERY=[
 {title:'A quiet villa that knows how to celebrate',city:'coimbatore',room:'full-home',art:'villa',href:'case-study-coimbatore-villa.html',tag:'Case study'},
 {title:'A 3BHK that finally fits a young family',city:'chennai',room:'kitchen',art:'kitchen',href:'case-study-chennai-3bhk.html',tag:'Case study'},
 {title:'A 2BHK rental turned first home',city:'bangalore',room:'living',art:'living',href:'case-study-bangalore-apartment.html',tag:'Case study'},
 {title:'An island kitchen built for a big family',city:'coimbatore',room:'kitchen',art:'kitchen',href:'kitchen-island.html',tag:'Kitchen'},
 {title:"Wardrobes that finally fit two people",city:'bangalore',room:'bedroom',art:'wardrobe',href:'wardrobes.html',tag:'Bedroom'},
 {title:'A pooja corner with room to breathe',city:'erode',room:'foyer',art:'pooja',href:'foyer-pooja-units.html',tag:'Foyer & Pooja'},
 {title:'A living room built around a big TV wall',city:'hyderabad',room:'living',art:'tv',href:'tv-units.html',tag:'Living room'},
 {title:'A U-shaped kitchen for a joint family',city:'guwahati',room:'kitchen',art:'kitchen',href:'kitchen-u-shaped.html',tag:'Kitchen'},
 {title:'A full home, handed over in 30 days',city:'chennai',room:'full-home',art:'villa',href:'full-home-interiors.html',tag:'Full home'}
];

const FAQ_GLOBAL=[
 {q:'How much do Homworks interiors cost?',a:"It depends on home size, finish level and the rooms you choose. Your designer confirms a fixed, itemised quote after your free consultation."},
 {q:'How long does a project take?',a:"Qualifying modular projects are covered by our 30-day delivery promise, counted from design sign-off, not your first phone call. Larger full-home civil works can take longer — your designer will confirm your exact timeline."},
 {q:'Is manufacturing really in-house?',a:"Yes. Every module is made and finished in our own factory in Coimbatore, not by third-party contractors — which is exactly what lets us commit to a delivery date."},
 {q:'What is covered under warranty?',a:"Every Homworks project carries a 10-year warranty on cabinetry, carcass and mechanisms, with a dedicated after-sales team for anything that needs a visit."},
 {q:'Which cities do you serve?',a:"Coimbatore, Chennai, Bangalore, Erode, Hyderabad and Guwahati today, with centres opening in more cities as we grow."},
 {q:'Can I make changes after design sign-off?',a:"Minor changes are usually possible before production begins. Larger changes once production has started may affect your timeline and cost — your project manager will always confirm before proceeding."},
 {q:'Do you offer EMI or financing?',a:"Yes, through our financing partners. Ask your designer during your free consultation for options that fit your budget."},
 {q:'What happens if I have a complaint?',a:"Every concern raised gets a ticket number and is escalated to a named grievance officer if not resolved immediately — trackable anytime from the Customer Portal."},
 {q:'Do I need to be present during installation?',a:"No. A dedicated project manager coordinates every stage on site and shares regular updates, so you do not need to be there full time."},
 {q:'How do I start?',a:"Book a free consultation. A Homworks designer calls you within 24 hours to understand your home and arrange a visit or video consultation."}
];

const ICON_SVG={
 home:'<path d="M3 9.5 10 3l7 6.5"/><path d="M5 8v9h10V8"/>',
 grid:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/>',
 sofa:'<path d="M4 9.5V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5"/><rect x="3" y="9.5" width="14" height="5" rx="1.3"/><path d="M4 14.5V16M16 14.5V16"/>',
 bed:'<path d="M3 16v-5.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V16"/><path d="M3 13h14"/><path d="M3 16v1M17 16v1"/><rect x="4.5" y="8.5" width="5" height="3" rx="1"/>',
 tv:'<rect x="3" y="4" width="14" height="9" rx="1.3"/><path d="M7 17h6M10 13v4"/>',
 wardrobe:'<rect x="4" y="3" width="12" height="14" rx="1"/><path d="M10 3v14"/><circle cx="8.3" cy="10" r=".6" fill="currentColor" stroke="none"/><circle cx="11.7" cy="10" r=".6" fill="currentColor" stroke="none"/>',
 box:'<path d="M3 7l7-4 7 4-7 4-7-4Z"/><path d="M3 7v6l7 4 7-4V7"/><path d="M10 11v6"/>',
 spark:'<path d="M10 3c1 2-1 3-1 5a2 2 0 1 0 4 0c0-1-.5-1.5-1-2"/><path d="M4 15c1.5-1 4-1.5 6-1.5s4.5.5 6 1.5"/><path d="M4 15c0 1.1 2.7 2 6 2s6-.9 6-2"/>',
 image:'<rect x="3" y="4" width="14" height="12" rx="1.5"/><circle cx="7.5" cy="8.5" r="1.3"/><path d="M17 13l-4-4-3 3-2-2-5 5"/>',
 file:'<path d="M6 3h6l4 4v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M12 3v4h4"/><path d="M7 11h6M7 14h6"/>',
 users:'<circle cx="7" cy="7" r="2.6"/><circle cx="14" cy="8" r="2.2"/><path d="M2.5 17c.5-3 2.3-4.6 4.5-4.6s4 1.6 4.5 4.6"/><path d="M12 17c.4-2.2 1.6-3.6 3.2-3.9"/>',
 pin:'<path d="M10 17s6-5.5 6-9.5A6 6 0 0 0 4 7.5C4 11.5 10 17 10 17Z"/><circle cx="10" cy="7.5" r="2"/>',
 compass:'<circle cx="10" cy="10" r="7.2"/><path d="M13 7l-2 6-4 2 2-6 4-2Z"/>',
 truck:'<path d="M2 6h9v8H2z"/><path d="M11 9h3.5L17 11.5V14h-6z"/><circle cx="6" cy="15.5" r="1.4"/><circle cx="14" cy="15.5" r="1.4"/>',
 shield:'<path d="M10 3l6 2.2v4.3c0 4-2.6 6.7-6 7.5-3.4-.8-6-3.5-6-7.5V5.2L10 3Z"/><path d="M7.3 10l1.8 1.8 3.6-3.6"/>',
 award:'<circle cx="10" cy="7.5" r="4.2"/><path d="M7.3 11l-1.3 5.5 4-1.8 4 1.8-1.3-5.5"/>',
 briefcase:'<rect x="2.5" y="6.5" width="15" height="9.5" rx="1.3"/><path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5"/><path d="M2.5 10.5h15"/>',
 thumbsup:'<path d="M6.3 9v8.3H3.8a1 1 0 0 1-1-1v-6.3a1 1 0 0 1 1-1h2.5Z"/><path d="M6.3 9.2 9.5 3.5c.5-.85 1.8-.5 1.8.45v3.7h3.4a1.6 1.6 0 0 1 1.58 1.9L15.1 15a1.6 1.6 0 0 1-1.58 1.3H6.3"/>'
};
function icon(name){return `<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG[name]||ICON_SVG.home}</svg>`}
function loopIcon(name){
 const withLen=(ICON_SVG[name]||ICON_SVG.home).replace(/<(path|rect|circle)(?![^>]*pathLength)/g,'<$1 pathLength="1"');
 return `<svg class="hc-ic-svg" width="21" height="21" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${withLen}</svg>`;
}

const MEGA={
 interiors:{cols:[
  {h:'Rooms',links:[
   {icon:'home',t:'Full Home Interiors',d:'Design-to-installation for every room',href:'full-home-interiors.html'},
   {icon:'grid',t:'Modular Kitchens',d:'Six engineered layouts to pick from',href:'modular-kitchens.html'},
   {icon:'sofa',t:'Living Rooms',d:'Storage and TV units built for family life',href:'living-rooms.html'},
   {icon:'bed',t:'Bedrooms',d:'Restful layouts, master to kids rooms',href:'bedrooms.html'}
  ]},
  {h:'Units & Styles',links:[
   {icon:'tv',t:'TV Units',d:'Media walls built around your screen',href:'tv-units.html'},
   {icon:'wardrobe',t:'Wardrobes',d:'Storage that fits two lives, not one',href:'wardrobes.html'},
   {icon:'box',t:'Shoe & Crockery Units',d:'Dedicated storage, done right',href:'shoe-crockery-units.html'},
   {icon:'spark',t:'Foyer & Pooja Units',d:'Vastu-aware, beautifully made',href:'foyer-pooja-units.html'}
  ]}
 ],feature:{k:'Moving soon?',b:'Plan your 30-day delivery.',p:'Choose rooms and city, then see a realistic route to move-in.',href:'delivery-planner.html',link:'Build my plan'}},
 projects:{cols:[
  {h:'Explore homes',links:[
   {icon:'image',t:'Project Gallery',d:'Filter real homes by city and room',href:'projects.html'},
   {icon:'file',t:'Case Studies',d:'The full story behind three homes',href:'customer-stories.html'},
   {icon:'users',t:'Customer Stories',d:'Reviews, in homeowners’ own words',href:'customer-stories.html'}
  ]},
  {h:'Browse by',links:[
   {icon:'pin',t:'City',d:'See projects near you',href:'locations.html'},
   {icon:'grid',t:'Room Type',d:'Kitchens, bedrooms and more',href:'interiors.html'},
   {icon:'home',t:'Full Home',d:'Whole-home transformations',href:'full-home-interiors.html'}
  ]}
 ],feature:{k:'See it built',b:'Find a home like yours.',p:'Real stories from real Homworks homes.',href:'customer-stories.html',link:'Browse stories'}},
 why:{cols:[
  {h:'Our promise',links:[
   {icon:'users',t:'About Us',d:'The story, the team, the factory',href:'about-us.html'},
   {icon:'compass',t:'How It Works',d:'Five steps, start to move-in',href:'how-it-works.html'},
   {icon:'truck',t:'30-Day Delivery',d:'Our on-time promise, in writing',href:'30-day-delivery.html'}
  ]},
  {h:'Our standards',links:[
   {icon:'shield',t:'Quality & Factory',d:'100+ checks, all in-house',href:'quality-factory.html'},
   {icon:'award',t:'Warranty & After-Sales',d:'10 years, one clear promise',href:'warranty-after-sales.html'},
   {icon:'briefcase',t:'Careers',d:'Open roles across six cities',href:'careers.html'}
  ]}
 ],feature:{k:'Every detail matters',b:'Made in-house. Managed with care.',p:'See what makes the Homworks process different.',href:'why-homworks.html',link:'Why us'}},
 locations:{cols:[
  {h:'Our centres',links:[
   {icon:'pin',t:'Coimbatore',d:'Corporate office · HQ',href:'location-coimbatore.html'},
   {icon:'pin',t:'Chennai',d:'Kovilambakkam centre',href:'location-chennai.html'},
   {icon:'pin',t:'Bangalore',d:'Banashankari centre',href:'location-bangalore.html'}
  ]},
  {h:'More centres',links:[
   {icon:'pin',t:'Erode',d:'Perundurai Road centre',href:'location-erode.html'},
   {icon:'pin',t:'Hyderabad',d:'Shamshabad centre',href:'location-hyderabad.html'},
   {icon:'pin',t:'Guwahati',d:'Lalmati centre',href:'location-guwahati.html'}
  ]}
 ],feature:{k:'See. touch. experience.',b:'Visit a Homworks centre.',p:'Find your nearest show home and meet a designer.',href:'show-home-visit.html',link:'Book a visit'}}
};

const WIZARD_CONFIG={
 consultation:{title:'Book your free consultation',subtitle:'A Homworks designer will call you within 24 hours.',chipLabel:'What are you planning?',chips:['Full home interiors','Modular kitchen','Living room','Bedroom & wardrobes','Pooja & foyer units','Not sure yet'],successTitle:'Consultation requested ✓',successBody:'A Homworks designer will call you within 24 hours to arrange your free consultation.'},
 quote:{title:'Get a detailed quote',subtitle:'Tell us the rooms, city and move-in date — we route this to your nearest team.',chipLabel:'Which rooms?',chips:['Full home','Modular kitchen','Living room','Bedroom','Wardrobes','TV unit'],successTitle:'Quote request received ✓',successBody:'Your nearest Homworks team will prepare an indicative quote and call you shortly.'},
 visit:{title:'Book a show-home visit',subtitle:'See, touch and experience a Homworks interior in person.',chipLabel:'Which centre would you like to visit?',chips:CITY_NAMES,successTitle:'Visit request received ✓',successBody:'We will confirm a convenient slot at your chosen centre over WhatsApp or call.'},
 grievance:{title:'Raise a grievance',subtitle:'Every concern gets a ticket number and a named grievance officer.',chipLabel:'What is this regarding?',chips:['Delivery delay','Installation quality','Warranty & service','Billing / payment','Staff conduct','Other'],successTitle:'Ticket raised ✓',successBody:'Your concern has been escalated to a named grievance officer. Track it anytime in the Customer Portal.',ticket:true},
 brochure:{title:'Download the Homworks brochure',subtitle:'Our design guide, finishes catalogue and process — sent straight to your inbox.',chipLabel:'Which brochure would you like?',chips:['Full home interiors','Modular kitchens','Bedrooms & wardrobes','Whole catalogue'],successTitle:'Brochure on its way ✓',successBody:'We have emailed your brochure. Check your inbox (and spam folder) in the next few minutes.'}
};

/* ===== Render helpers ===== */
function kineticText(str){
 return [...str].map((ch,i)=>`<span class="tw-ch" style="animation-delay:${(i*0.045).toFixed(2)}s">${ch===' '?'&nbsp;':ch}</span>`).join('');
}
function crumbHTML(crumbs,showPromo){
 const path=crumbs.map((c,i)=>(c.h?`<a href="${c.h}">${c.l}</a>`:c.l)+(i<crumbs.length-1?' / ':'')).join('');
 const promo=showPromo===false?'':`<a class="crumb-promo" href="30-day-delivery.html"><span class="crumb-promo-ic">${icon('thumbsup')}</span><span class="crumb-promo-text">${kineticText('30-Day Delivery, As Promised')}</span></a>`;
 return `<div class="container crumb"><span class="crumb-path">${path}</span>${promo}</div>`;
}
function ctasHTML(ctas){
 return `<div class="hero2-ctas">`+ctas.map(c=>c.form?`<button type="button" class="btn ${c.primary?'lime':'on-dark'}" onclick="openForm('${c.form}')">${c.label} <b>↗</b></button>`:`<a class="btn ${c.primary?'lime':'on-dark'}" href="${c.href}">${c.label} <b>↗</b></a>`).join('')+`</div>`;
}
function heroStatsHTML(stats){
 return `<div class="hero2-stats">`+stats.map(s=>`<div><b>${s.n}</b><span>${s.l}</span></div>`).join('')+`</div>`;
}
function panelHTML(p){
 return `<div class="hero2-panel"><h4>${p.title}</h4>
 <select id="pf-room"><option value="">${p.roomLabel||'Choose a room'}</option>${(p.rooms||DEFAULT_ROOMS).map(r=>`<option>${r}</option>`).join('')}</select>
 <select id="pf-city"><option value="">Choose your city</option>${CITY_NAMES.map(c=>`<option>${c}</option>`).join('')}</select>
 <button type="button" class="btn lime" onclick="submitFinder()">${p.cta||'Find my fit'} <b>↗</b></button></div>`;
}
function chipsHTML(chips){
 return `<div class="hero2-chips">${chips.names.map(n=>`<span class="chip-av" style="background:${avatarColor(n)}">${initials(n)}</span>`).join('')}<span>${chips.label}</span></div>`;
}
function clusterHTML(items){
 return `<div class="hero2-cluster">${items.map(c=>`<a class="hc-card art-panel" data-art="${c.art}" href="${c.href}"><span class="hc-ic">${loopIcon(c.icon||'home')}</span><b>${c.title}</b><span class="hc-sub">${c.sub}</span></a>`).join('')}</div>`;
}
function heroHTML(d){
 const h=d.hero;
 if(h.style==='plain'){
  return `<section class="hero2 plain"><div class="container"><span class="eyebrow hero2-kicker">${h.kicker}</span><h1>${h.h1}</h1><p class="hero2-copy">${h.copy}</p>${h.ctas?ctasHTML(h.ctas):''}</div></section>`;
 }
 const media=HERO_MEDIA[h.art]||HERO_MEDIA.living;
 return `<section class="hero2 ${h.duo||'duo-deep'}"><div class="hero2-clip"><div class="hero2-media" style="--image:url('${media.cssPoster}')"><video class="hero2-video" autoplay muted loop playsinline preload="auto" poster="${media.poster}"><source src="${media.video}" type="video/mp4"></video></div></div><div class="container">
 <span class="eyebrow hero2-kicker">${h.kicker}</span><h1>${h.h1}</h1><p class="hero2-copy">${h.copy}</p>
 ${h.ctas?ctasHTML(h.ctas):''}
 ${h.stats?heroStatsHTML(h.stats):''}
 ${h.panel?panelHTML(h.panel):''}
 ${h.chips?chipsHTML(h.chips):''}
 ${h.cluster?clusterHTML(h.cluster):''}
 </div></section>`;
}
function statsRowHTML(stats){
 return `<section class="container"><div class="stats-row rv">`+stats.map(s=>`<div class="stat"><b class="cnt" data-num="${s.num}" data-suffix="${s.suffix||''}">0${s.suffix||''}</b><span>${s.label}</span></div>`).join('')+`</div></section>`;
}
function introHTML(i){
 return `<section class="section tight container"><div class="intro2 rv"><div><span class="eyebrow">${i.eyebrow}</span><h2>${i.h2}</h2></div><div class="intro2-copy"><p>${i.body}</p>${i.link?`<a class="link-arrow" href="${i.link.href}">${i.link.label}</a>`:''}</div></div></section>`;
}
function metaRowHTML(items){
 return `<div class="container"><div class="meta-row rv">${items.map(i=>`<div><b>${i.v}</b><span>${i.k}</span></div>`).join('')}</div></div>`;
}
function cardHTML(c,flat){
 if(flat){
  return `<div class="tcard flat"><div class="tcard-body">${c.tag?`<span class="eyebrow" style="color:var(--terra)">${c.tag}</span>`:''}<h3>${c.title}</h3><p>${c.body}</p>${c.href?`<a class="tcard-link" href="${c.href}">${c.linkLabel||'Learn more'}</a>`:''}</div></div>`;
 }
 const inner=`<div class="tcard-media art-panel" data-art="${c.art||'living'}"><span class="tcard-glare"></span>${c.tag?`<span class="tcard-tag">${c.tag}</span>`:''}</div><div class="tcard-body"><h3>${c.title}</h3><p>${c.body}</p><span class="tcard-link">${c.linkLabel||'Explore'}</span></div>`;
 if(c.form) return `<button type="button" class="tcard" style="width:100%;text-align:left" onclick="openForm('${c.form}')">${inner}</button>`;
 return `<a class="tcard" href="${c.href||'#'}">${inner}</a>`;
}
function cardsSectionHTML(cs){
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">${cs.eyebrow}</span><h2>${cs.h2}</h2></div>${cs.note?`<p>${cs.note}</p>`:''}</div>
 <div class="tgrid ${cs.cols?'cols-'+cs.cols:''} rv-stag">${cs.items.map(it=>cardHTML(it,cs.flat)).join('')}</div></section>`;
}
function carouselSectionHTML(cs){
 const items=cs.items.concat(cs.items);
 return `<section class="section tight"><div class="container section-head rv"><div><span class="eyebrow">${cs.eyebrow}</span><h2>${cs.h2}</h2></div></div>
 <div class="carousel" data-mode="marquee" style="--dur:${cs.dur||34}s"><div class="carousel-track">${items.map(r=>`<a class="roll-card art-panel" data-art="${r.art}" href="${r.href||'#'}"><span class="rc-tag"><small>${r.small}</small>${r.title}</span></a>`).join('')}</div></div></section>`;
}
function testimonialsHTML(cs){
 const wid='car'+Math.random().toString(36).slice(2,7);
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">${cs.eyebrow}</span><h2>${cs.h2}</h2></div></div>
 <div class="carousel-wrap" id="${wid}">
 <div class="carousel" data-mode="slides"><div class="carousel-track">${cs.items.map(t=>`<div class="tslide"><q>${t.q}</q><cite><span class="avatar" style="background:${avatarColor(t.name)}">${initials(t.name)}</span><b>${t.name}</b>${t.meta}</cite></div>`).join('')}</div></div>
 <div class="carousel-arrows"><button type="button" onclick="slideGo('${wid}',-1)">←</button><button type="button" onclick="slideGo('${wid}',1)">→</button></div>
 <div class="carousel-dots">${cs.items.map((_,i)=>`<button type="button" class="${i===0?'active':''}" onclick="slideGo('${wid}',0,${i})"></button>`).join('')}</div>
 </div></section>`;
}
function singleTestimonialHTML(cs){
 return `<section class="section tight container"><div class="tslide rv" style="max-width:720px;margin:0 auto"><q>${cs.quote}</q><cite><span class="avatar" style="background:${avatarColor(cs.name)}">${initials(cs.name)}</span><b>${cs.name}</b>${cs.role}</cite></div></section>`;
}
function stepsSectionHTML(st){
 return `<section class="section proc-dark"><div class="container"><div class="section-head rv"><div><span class="eyebrow">${st.eyebrow}</span><h2>${st.h2}</h2></div><p>${st.note||''}</p></div>
 <div class="steps2 count-${st.items.length}">${st.items.map((s,i)=>`<article class="step2"><span class="step-no">0${i+1} / ${s.tag}</span><h3>${s.title}</h3><p>${s.body}</p></article>`).join('')}</div></div></section>`;
}
function faqSectionHTML(f){
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">${f.eyebrow||'Questions'}</span><h2>${f.h2||'Frequently asked'}</h2></div></div>
 <div class="faq rv">${f.items.map((q,i)=>`<div class="faq-item${i===0?' open':''}"><button type="button" class="faq-q" onclick="this.parentElement.classList.toggle('open')">${q.q}<i>+</i></button><div class="faq-a-wrap"><div class="faq-a"><p>${q.a}</p></div></div></div>`).join('')}</div></section>`;
}
function ctaHTML(c){
 if(!c) return '';
 if(c.mailto) return `<section class="cta2"><div class="container cta2-wrap"><div><span class="eyebrow" style="color:#ffe1e5">${c.eyebrow||'Ready when you are'}</span><h2>${c.h2}</h2><p>${c.body}</p></div><a class="btn" href="mailto:${c.mailto}">${c.label||'Email Homworks'} <b>↗</b></a></div></section>`;
 return `<section class="cta2"><div class="container cta2-wrap"><div><span class="eyebrow" style="color:#ffe1e5">${c.eyebrow||'Ready when you are'}</span><h2>${c.h2}</h2><p>${c.body}</p></div><button type="button" class="btn" onclick="openForm('${c.formType||'consultation'}')">${c.label||'Book free consultation'} <b>↗</b></button></div></section>`;
}
function beforeAfterHTML(art){
 const poster=(HERO_MEDIA[art]||HERO_MEDIA.villa).cssPoster;
 return `<div class="before-after rv" style="--split:50%"><div class="ba-after" style="--image:url('${poster}')"></div><div class="ba-before"><div class="ba-before-inner"></div></div><div class="ba-handle">⇔</div><input class="ba-range" type="range" min="0" max="100" value="50" oninput="this.parentElement.style.setProperty('--split',this.value+'%')"></div>`;
}
function beforeAfterSectionHTML(art){
 return `<section class="section tight"><div class="container"><div class="section-head rv"><div><span class="eyebrow">Before & after</span><h2>Drag to reveal the transformation.</h2></div><p>Concept render shown before real project photography — drag the handle.</p></div>${beforeAfterHTML(art)}</div></section>`;
}
function addressBlockHTML(addr){
 return `<div class="container" style="padding-bottom:80px"><div class="gate-card rv" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px"><div><span class="eyebrow">Centre address</span><p style="margin:10px 0 0;font-size:14px;max-width:480px">${addr}</p></div><a class="btn primary" href="https://www.google.com/maps/search/${encodeURIComponent(addr)}" target="_blank" rel="noopener">Get directions <b>↗</b></a></div></div>`;
}
function articleHTML(a){
 const paras=a.body.map(t=>`<p>${t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')}</p>`).join('');
 return `<section class="section container"><div style="max-width:720px;margin:0 auto" class="rv"><div style="font-size:17px;line-height:1.85;color:var(--muted)">${paras}</div>
 ${a.pull?`<blockquote style="border-left:3px solid var(--terra);margin:36px 0;padding:4px 0 4px 24px;font:600 22px/1.4 var(--sans);letter-spacing:-.011em;color:var(--deep)">${a.pull}</blockquote>`:''}
 </div></section>`;
}
function citySwitchHTML(){
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">Our centres</span><h2>Six cities. One experience.</h2></div><p>Pick a city to see the centre, the team and how to book a visit.</p></div>
 <div class="city-switch rv"><div class="city-list">${CITIES.map((c,i)=>`<button type="button" class="city-btn${i===0?' active':''}" onclick="switchCity(this,'${c.slug}')">${c.name}<span>${c.tag}</span></button>`).join('')}</div>
 <div class="city-panel">${CITIES.map((c,i)=>`<div class="city-panel-inner${i===0?' active':''}" data-panel="${c.slug}"><div class="city-pin">📍</div><h3>${c.name}</h3><p>${c.blurb}</p><div class="city-meta"><div><b>${c.homes}</b><span>Homes delivered</span></div><div><b>${c.since}</b><span>Serving since</span></div><div><b>${c.days}</b><span>Avg. delivery</span></div></div><p style="font-size:12.5px">${c.address}</p><div class="hero2-ctas" style="margin-top:10px"><a class="btn primary" href="location-${c.slug}.html">Visit ${c.name} page <b>↗</b></a><button type="button" class="btn" onclick="openForm('visit','${c.name}')">Book a visit <b>↗</b></button></div></div>`).join('')}</div></div></section>`;
}
function plannerHTML(){
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">Interactive tool</span><h2>Build your delivery timeline.</h2></div><p>Pick your rooms and city — we will sketch a realistic route to move-in day.</p></div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px" class="rv">
 <div class="planner">
  <div class="planner-row"><label>Which rooms?</label><div class="chips" id="plRooms">${['Full home','Modular kitchen','Living room','Bedroom','Wardrobes','Pooja & foyer'].map(r=>`<button type="button" class="chip" data-room="${r}" onclick="this.classList.toggle('active')">${r}</button>`).join('')}</div></div>
  <div class="planner-row"><label>Your city</label><select id="plCity"><option value="">Select city</option>${CITY_NAMES.map(c=>`<option>${c}</option>`).join('')}</select></div>
  <button type="button" class="btn primary" style="width:100%;justify-content:center" onclick="buildTimeline()">Generate my plan <b>↗</b></button>
 </div>
 <div><div class="timeline" id="plTimeline"><div class="timeline-fill" id="plFill"></div>
  <div class="timeline-step" data-s="1"><b>Design sign-off</b><span>Meet your designer, approve the 3D plan and fixed quote.</span></div>
  <div class="timeline-step" data-s="2"><b>Production starts</b><span>Your modules move into factory production.</span></div>
  <div class="timeline-step" data-s="3"><b>Installation</b><span>Our own team installs on site, with daily updates.</span></div>
  <div class="timeline-step" data-s="4"><b>Move-in</b><span>Final quality check, handover and warranty activation.</span></div>
 </div><p id="plNote" style="font-size:12px;color:var(--muted);margin-top:16px">Select rooms and a city, then generate your plan.</p></div>
 </div></section>`;
}
function dayTimelineHTML(){
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">Your 30 days</span><h2>A timeline you can plan around.</h2></div><p>What starts the clock, and what happens next.</p></div>
 <div class="timeline rv" id="dayTimeline"><div class="timeline-fill"></div>
 <div class="timeline-step"><b>Your project plan</b><span>Rooms, budget and a realistic timeline, agreed before design begins.</span></div>
 <div class="timeline-step"><b>Design sign-off</b><span>Day 0 — the clock starts the moment you approve your 3D design and fixed quote.</span></div>
 <div class="timeline-step"><b>Production starts</b><span>Your modules move into our own factory — not a third-party workshop.</span></div>
 <div class="timeline-step"><b>Installation day</b><span>Our own installation team fits your home on site, with daily updates.</span></div>
 <div class="timeline-step"><b>Quality check</b><span>A 100+ point check before final handover.</span></div>
 <div class="timeline-step"><b>Move-in support</b><span>Your 10-year warranty activates the day you move in.</span></div>
 </div></section>`;
}
function grievanceFlowHTML(){
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">How it works</span><h2>Raise once. Track to resolution.</h2></div><p>Every concern gets a ticket number and a named grievance officer.</p></div>
 <div class="timeline rv" id="grTimeline"><div class="timeline-fill"></div>
 <div class="timeline-step"><b>Raise it online</b><span>Submit the form below or call our toll-free number — takes under two minutes.</span></div>
 <div class="timeline-step"><b>Ticket & acknowledgement</b><span>You receive a ticket number instantly, with acknowledgement within 24 hours.</span></div>
 <div class="timeline-step"><b>Escalation to grievance officer</b><span>Unresolved concerns are escalated to a named grievance officer, not a queue.</span></div>
 <div class="timeline-step"><b>Resolved & feedback</b><span>Closed out with your sign-off, visible anytime in the Customer Portal.</span></div>
 </div>
 <div style="margin-top:40px" class="rv"><button type="button" class="btn primary" onclick="openForm('grievance')">Raise a grievance now <b>↗</b></button></div>
 </section>`;
}
function portalDashHTML(){
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">Preview</span><h2>Your project, at a glance.</h2></div><p>This is an illustrative preview — sign in from the mobile app or web portal for your live project.</p></div>
 <div class="stats-row rv"><div class="stat"><b>Day 18</b><span>of your 30-day plan</span></div><div class="stat"><b>3 / 4</b><span>Approvals complete</span></div><div class="stat"><b>2</b><span>Service tickets open</span></div><div class="stat"><b>96%</b><span>Installation complete</span></div></div></section>`;
}
function galleryContentHTML(){
 const tags=['all','coimbatore','chennai','bangalore','erode','hyderabad','guwahati','kitchen','living','bedroom','full-home','foyer'];
 return `<section class="section container"><div class="section-head rv"><div><span class="eyebrow">Filter</span><h2>Browse by city or room.</h2></div></div>
 <div class="gfilters rv">${tags.map((t,i)=>`<button type="button" class="${i===0?'active':''}" onclick="filterGallery(this,'projGrid','${t}')">${t==='all'?'All projects':t==='full-home'?'Full home':cap(t)}</button>`).join('')}</div>
 <div class="tgrid rv-stag" id="projGrid">${PROJECTS_GALLERY.map(it=>`<a class="tcard" href="${it.href}" data-tags="${it.city} ${it.room}"><div class="tcard-media art-panel" data-art="${it.art}"><span class="tcard-glare"></span><span class="tcard-tag">${it.tag}</span></div><div class="tcard-body"><h3>${it.title}</h3><p>${cap(it.city)} · ${cap(it.room).replace('-',' ')}</p><span class="tcard-link">View</span></div></a>`).join('')}</div></section>`;
}

/* ===== Chrome: header, mobile nav, footer ===== */
function navItem(href,label,mega){
 return `<div class="nav-item"><a href="${href}">${label}</a><div class="mega">
 ${mega.cols.map(col=>`<div class="mega-col"><h4>${col.h}</h4>${col.links.map(l=>`<a href="${l.href}" class="mega-link"><span class="mega-ic">${icon(l.icon)}</span><span><b>${l.t}</b><small>${l.d}</small></span></a>`).join('')}</div>`).join('')}
 <div class="mega-feature"><span class="eyebrow">${mega.feature.k}</span><b>${mega.feature.b}</b><p>${mega.feature.p}</p><a href="${mega.feature.href}">${mega.feature.link} ↗</a></div>
 </div></div>`;
}
function mobileNavHTML(){
 const top=[['interiors.html','Interiors'],['projects.html','Projects'],['why-homworks.html','Why Homworks'],['locations.html','Locations'],['resources.html','Resources'],['contact.html','Contact']];
 return top.map(x=>`<a href="${x[0]}">${x[1]}</a>`).join('')+`<a href="get-a-quote.html" style="color:var(--ink)">Get a free quote →</a>`;
}
function chromeHeader(){
 return `<header class="top" id="siteHeader"><div class="bar">
 <nav class="nav-side side-l">
 ${navItem('interiors.html','Interiors',MEGA.interiors)}
 ${navItem('projects.html','Projects',MEGA.projects)}
 ${navItem('why-homworks.html','Why Homworks',MEGA.why)}
 </nav>
 <a href="index.html" class="brand-center" aria-label="Homworks home"><img class="brand-logo" src="assets/logo-footer.png" alt="Homworks"></a>
 <div class="nav-side side-r">
 ${navItem('locations.html','Locations',MEGA.locations)}
 <div class="nav-item"><a href="resources.html">Resources</a></div>
 <div class="nav-item"><a href="contact.html">Contact</a></div>
 <a href="get-a-quote.html" class="nav-cta"><span>Get a free quote</span></a>
 </div>
 <button type="button" class="menu-btn" aria-label="Open navigation" onclick="document.getElementById('mnav').classList.toggle('show')">☰</button>
 </div>
 <div class="mnav" id="mnav">${mobileNavHTML()}</div>
 </header>`;
}
function chromeFooter(){
 return `<footer class="foot"><div class="container"><div class="foot-grid">
 <div><img src="assets/homworks-logo.png" width="150" alt="Homworks" style="filter:brightness(0) invert(1)"><p class="foot-intro">Thoughtful home interiors, crafted for the way India lives now.</p></div>
 <div><h4>Interiors</h4><a href="full-home-interiors.html">Full Home Interiors</a><a href="modular-kitchens.html">Modular Kitchens</a><a href="living-rooms.html">Living Rooms</a><a href="bedrooms.html">Bedrooms</a><a href="wardrobes.html">Wardrobes</a></div>
 <div><h4>Explore</h4><a href="projects.html">Projects</a><a href="why-homworks.html">Why Homworks</a><a href="locations.html">Locations</a><a href="resources.html">Resources</a><a href="blog.html">Blog</a></div>
 <div><h4>Company</h4><a href="about-us.html">About Us</a><a href="careers.html">Careers</a><a href="faqs.html">FAQs</a><a href="customer-portal.html">Customer Portal</a></div>
 <div><h4>Get in touch</h4><a href="tel:18001213110">1800 121 3110</a><a href="mailto:enquiry@homworks.com">enquiry@homworks.com</a><a href="show-home-visit.html">Book a show-home visit</a><a href="grievance.html">Grievance redressal</a></div>
 </div>
 <div class="foot-addr"><span class="eyebrow" style="color:#9fdedc">Our centres</span><nav>${CITIES.map(c=>`<a href="location-${c.slug}.html">${c.name}${c.slug==='coimbatore'?' · HQ':''}</a>`).join('')}</nav></div>
 <div class="foot-bottom"><span>© 2026 Homworks – Stylcove Modulars Pvt Ltd.</span><span><a href="privacy-policy.html">Privacy</a> · <a href="terms-and-conditions.html">Terms</a> · <a href="sitemap.html">Sitemap</a></span></div>
 </div></footer>
 <button type="button" class="fab" aria-label="Chat on WhatsApp" onclick="window.open('https://wa.me/918925811898','_blank')">☎</button>
 <div class="modal" id="modal"><div class="modal-card"></div></div>`;
}

/* ===== Page dispatcher ===== */
function renderBody(slug){
 const d=PAGES[slug];
 if(!d) return render404Content();
 if(d.type==='search') return renderSearchContent(d);
 if(d.type==='notfound') return render404Content(d);
 if(d.type==='thankyou') return renderThankYouContent(d);
 if(d.type==='sitemap') return renderSitemapContent(d);
 let html='';
 html+=crumbHTML(d.crumbs);
 html+=heroHTML(d);
 if(d.metaRow) html+=metaRowHTML(d.metaRow);
 if(d.stats) html+=statsRowHTML(d.stats);
 if(d.intro) html+=introHTML(d.intro);
 if(d.type==='locations-hub') html+=citySwitchHTML();
 if(d.type==='gallery') html+=galleryContentHTML();
 if(d.type==='planner') html+=plannerHTML();
 if(d.type==='delivery') html+=dayTimelineHTML();
 if(d.type==='case-study') html+=beforeAfterSectionHTML(d.hero.art);
 if(d.cardsSection) html+=cardsSectionHTML(d.cardsSection);
 if(d.type==='city' && d.address) html+=addressBlockHTML(d.address);
 if(d.article) html+=articleHTML(d.article);
 if(d.carousel) html+=carouselSectionHTML(d.carousel);
 if(d.testimonial) html+=singleTestimonialHTML(d.testimonial);
 if(d.testimonialsSection) html+=testimonialsHTML(d.testimonialsSection);
 if(d.steps) html+=stepsSectionHTML(d.steps);
 if(d.type==='grievance') html+=grievanceFlowHTML();
 if(d.type==='portal') html+=portalDashHTML();
 if(d.faq) html+=faqSectionHTML(d.faq);
 if(d.faqGroups) html+=d.faqGroups.map(faqSectionHTML).join('');
 if(d.legal) html+=legalHTML(d.legal);
 if(d.cta) html+=ctaHTML(d.cta);
 return html;
}

/* ===== Utility page renderers ===== */
function renderSearchContent(d){
 return crumbHTML(d.crumbs,false)+heroHTML(d)+`<section class="section container"><div class="search-box rv"><input id="searchInput" placeholder="Search kitchens, bedrooms, cities, FAQs…" oninput="doSearch(this.value)"></div><div class="tgrid cols-3 rv-stag" id="searchResults"></div></section>`;
}
function render404Content(){
 const top=SITE_LINKS.filter(l=>l.top).slice(0,6);
 return crumbHTML([{l:'Home',h:'index.html'},{l:'Page not found'}],false)+`<section class="section container" style="text-align:center;padding-top:130px">
 <span class="err-num">404</span>
 <h1 style="font:600 clamp(24px,3vw,34px)/1.2;letter-spacing:-.011em;margin:18px 0 10px">This room isn't built yet.</h1>
 <p style="color:var(--muted);max-width:440px;margin:0 auto 30px">The page you're looking for may have moved. Try a search, or jump to one of these.</p>
 <div class="search-box rv" style="max-width:520px;margin:0 auto 40px"><input id="searchInput" placeholder="Search Homworks…" oninput="doSearch(this.value)"></div>
 </section>
 <section class="section container" style="padding-top:0"><div class="tgrid cols-3 rv-stag">${top.map(r=>`<a class="tcard flat" href="${r.href}"><div class="tcard-body"><span class="eyebrow" style="color:var(--ink)">${r.pillar}</span><h3>${r.label}</h3><p>${r.desc}</p></div></a>`).join('')}</div></section>`;
}
function renderThankYouContent(){
 const params=new URLSearchParams(location.search);
 const type=params.get('type')||'consultation';const ref=params.get('ref')||'HMW-00000';
 const cfg=WIZARD_CONFIG[type]||WIZARD_CONFIG.consultation;
 return crumbHTML([{l:'Home',h:'index.html'},{l:'Thank you'}],false)+
 `<section class="section container" style="padding-top:120px;text-align:center">
 <div class="wsuccess rv" style="max-width:520px;margin:0 auto"><div class="tick" style="margin:0 auto 22px">✓</div>
 <h1 style="font:600 clamp(28px,4vw,42px)/1.1;letter-spacing:-.017em;margin:0 0 12px">${cfg.successTitle}</h1>
 <p style="color:var(--muted);font-size:15px">${cfg.successBody}</p><span class="ref">REF ${ref}</span></div></section>
 <section class="section container" style="padding-top:0"><div class="steps2 count-3 rv" style="border-top:1px solid var(--line)">
 <div class="step2" style="color:var(--deep);border-color:var(--line)"><span class="step-no" style="color:var(--ink)">01</span><h3 style="margin-top:40px">We reach out</h3><p style="opacity:1;color:var(--muted)">A Homworks team member calls or WhatsApps you within 24 hours.</p></div>
 <div class="step2" style="color:var(--deep);border-color:var(--line)"><span class="step-no" style="color:var(--ink)">02</span><h3 style="margin-top:40px">We understand your home</h3><p style="opacity:1;color:var(--muted)">A short call or visit to understand your rooms, budget and timeline.</p></div>
 <div class="step2" style="color:var(--deep);border-color:var(--line)"><span class="step-no" style="color:var(--ink)">03</span><h3 style="margin-top:40px">You get a fixed quote</h3><p style="opacity:1;color:var(--muted)">A transparent, itemised quote — no surprises later.</p></div></div>
 <div class="hero2-ctas" style="justify-content:center;margin-top:40px"><a class="btn primary" href="index.html">Back to home <b>↗</b></a><button type="button" class="btn" onclick="window.open('https://wa.me/918925811898','_blank')">Message us on WhatsApp <b>↗</b></button></div>
 </section>`;
}
function renderSitemapContent(d){
 const groups={};
 SITE_LINKS.forEach(l=>{(groups[l.pillar]=groups[l.pillar]||[]).push(l)});
 return crumbHTML([{l:'Home',h:'index.html'},{l:'Sitemap'}],false)+heroHTML(d)+
 `<section class="section container"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px" class="rv-stag">${Object.keys(groups).map(g=>`<div><h4 style="font:10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--ink);margin:0 0 16px">${g}</h4>${groups[g].map(l=>`<a href="${l.href}" style="display:block;font-size:13.5px;color:var(--deep);margin:9px 0">${l.label}</a>`).join('')}</div>`).join('')}</div></section>`;
}

/* ===== Generated-page factories ===== */
function kitchenLayoutPage(l,i){
 const others=KITCHEN_LAYOUTS.filter(x=>x.slug!==l.slug);
 return {
  title:l.name+' Kitchen Designs',top:l.slug==='l-shaped',
  metaDesc:`${l.name} modular kitchen designs by Homworks — ${l.blurb}`,
  crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Modular Kitchens',h:'modular-kitchens.html'},{l:l.name}],
  hero:{style:'art',art:'kitchen',duo:'duo-terra',kicker:`Modular Kitchens / Layout 0${i+1} of 6`,h1:l.h1,copy:l.blurb,
  stats:[{n:l.footprint,l:'Typical footprint'},{n:l.bestFor,l:'Best for'},{n:'10-yr',l:'Warranty'}],
  ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See kitchen projects',href:'projects.html'}]},
  intro:{eyebrow:'Why families choose this layout',h2:'Built around how you actually cook.',body:l.blurb+' Every Homworks kitchen is manufactured in-house and quality-checked over 100 times before it reaches your home.',link:{label:'See all 6 kitchen layouts',href:'modular-kitchens.html'}},
  cardsSection:{eyebrow:'What you get',h2:'Four reasons this layout works.',flat:true,cols:2,items:l.pros.map((p,idx)=>({tag:'0'+(idx+1),title:p.t,body:p.b}))},
  carousel:{eyebrow:'Explore other layouts',h2:'Six ways to lay out a kitchen.',dur:30,items:others.map(o=>({art:'kitchen',small:'Layout',title:o.name,href:'kitchen-'+o.slug+'.html'}))},
  faq:{eyebrow:'Questions',h2:`${l.name} kitchen FAQs`,items:[
  {q:`How much does a ${l.name.toLowerCase()} kitchen cost?`,a:`Pricing depends on layout, finish level and hardware. Your designer confirms a fixed quote after your free consultation.`},
  {q:`Is the ${l.name.toLowerCase()} layout right for my home?`,a:`It works best for ${l.bestFor.toLowerCase()}, with a typical footprint of ${l.footprint}. A designer can confirm fit from your floor plan in the free consultation.`},
  {q:'Can I combine this with an island or breakfast counter?',a:'Yes — several layouts can be extended with a peninsula or island where floor area allows. Your designer will show you the option during design.'}
  ]},
  cta:{h2:"Let's plan your "+l.name.toLowerCase()+' kitchen.',body:'Book a free consultation and see a 3D layout of your kitchen before you commit to anything.',formType:'quote',label:'Get a kitchen quote'}
 };
}
function cityPage(c){
 return {
  title:'Homworks '+c.name+' — Interior Design Centre',
  metaDesc:`Homworks interior design centre in ${c.name}. ${c.blurb}`,
  crumbs:[{l:'Home',h:'index.html'},{l:'Locations',h:'locations.html'},{l:c.name}],
  type:'city',
  hero:{style:'photo',art:'city',duo:'duo-ink',kicker:'Locations / '+c.tag,h1:c.name+',<br>done the Homworks way.',copy:c.blurb,
  stats:[{n:c.homes,l:'Homes delivered'},{n:c.days,l:'Avg. delivery'},{n:'10-yr',l:'Warranty'}],
  panel:{title:'Book a visit to '+c.name,cta:'Book my visit'},
  ctas:[{label:'Book a show-home visit',form:'visit',primary:true},{label:'Call this centre',href:'tel:18001213110'}]},
  metaRow:[{k:'Centre',v:c.tag},{k:'Serving since',v:c.since},{k:'Homes delivered',v:c.homes},{k:'Avg. delivery',v:c.days}],
  intro:{eyebrow:'The '+c.name+' centre',h2:'Meet a designer near you.',body:c.blurb+' Every project — whichever centre you visit — is designed, manufactured and installed by one accountable Homworks team, backed by a 10-year warranty.',link:{label:'See all six centres',href:'locations.html'}},
  cardsSection:{eyebrow:'Local highlights',h2:'Why homeowners in '+c.name+' choose Homworks.',cols:3,items:[
  {art:'villa',tag:'Show home',title:'Visit the '+c.name+' show home',body:'Walk through finished kitchens, wardrobes and living rooms before you decide on yours.',form:'visit',linkLabel:'Book a visit'},
  {art:'kitchen',tag:'Popular here',title:'Modular kitchens in '+c.name,body:'See the layouts and finishes homeowners in '+c.name+' ask for most.',href:'modular-kitchens.html'},
  {art:'process',tag:'Our promise',title:'The 30-day delivery promise',body:'On-time installation with regular project updates, tracked from design sign-off to move-in.',href:'30-day-delivery.html'}
  ]},
  address:c.address,
  cta:{h2:'Come see what home can feel like.',body:'Meet a Homworks designer at the '+c.name+' centre and see a show home in person.',formType:'visit',label:'Book a show-home visit'}
 };
}
function blogCatPage(c){
 const posts=BLOG_POSTS.filter(p=>p.cat===c.slug);
 return {
  title:c.name+' Ideas & Guides',
  metaDesc:c.blurb,
  crumbs:[{l:'Home',h:'index.html'},{l:'Resources',h:'resources.html'},{l:'Blog',h:'blog.html'},{l:c.name}],
  hero:{style:'art',art:c.art,duo:'duo-deep',kicker:'Blog / '+c.name,h1:c.name+'<br>ideas & guides.',copy:c.blurb,ctas:[{label:'All guides',href:'blog.html'},{label:'Book free consultation',form:'consultation'}]},
  cardsSection:{eyebrow:'Latest',h2:'Guides in '+c.name.toLowerCase()+'.',cols:3,items:[
  ...posts.map(p=>({art:p.art,tag:p.read,title:p.title,body:p.excerpt,href:'blog-post-'+p.slug+'.html'})),
  {art:c.art,tag:'Coming soon',title:'More '+c.name.toLowerCase()+' guides on the way',body:'We publish two to four new guides a month. Check back soon, or ask your designer directly.',href:'faqs.html',linkLabel:'Ask a question'}
  ]},
  cta:{h2:'Still deciding?',body:'A free consultation is the fastest way to get answers specific to your home.',formType:'consultation'}
 };
}
function blogPostPage(p){
 const cat=BLOG_CATEGORIES.find(c=>c.slug===p.cat);
 const related=BLOG_POSTS.filter(x=>x.slug!==p.slug).slice(0,2);
 return {
  title:p.title,
  metaDesc:p.excerpt,
  crumbs:[{l:'Home',h:'index.html'},{l:'Resources',h:'resources.html'},{l:'Blog',h:'blog.html'},{l:cat.name,h:'blog-'+cat.slug+'.html'},{l:p.title}],
  hero:{style:'art',art:p.art,duo:'duo-ink',kicker:'Blog / '+cat.name+' · '+p.read,h1:p.title,copy:p.excerpt},
  article:{body:p.body,pull:p.pull},
  cardsSection:{eyebrow:'Keep reading',h2:'More from '+cat.name.toLowerCase()+' and beyond.',cols:3,items:[...related.map(r=>({art:r.art,tag:r.read,title:r.title,body:r.excerpt,href:'blog-post-'+r.slug+'.html'})),{art:cat.art,tag:'Hub',title:'All '+cat.name.toLowerCase()+' guides',body:cat.blurb,href:'blog-'+cat.slug+'.html'}]},
  cta:{h2:'Ready to start your own project?',body:'Book a free consultation and get a fixed quote before you decide on anything.',formType:'consultation'}
 };
}
function caseStudyPage(cs){
 return {
  title:cs.title,
  metaDesc:cs.title+' — a Homworks '+cs.homeType.toLowerCase()+' in '+cs.city+'.',
  crumbs:[{l:'Home',h:'index.html'},{l:'Projects',h:'projects.html'},{l:cs.title}],
  type:'case-study',
  hero:{style:'photo',art:cs.art,duo:'duo-deep',kicker:'Case study / '+cs.city,h1:cs.title,copy:cs.brief,ctas:[{label:'Book a show-home visit',form:'visit',primary:true},{label:'See more projects',href:'projects.html'}]},
  metaRow:[{k:'Home type',v:cs.homeType},{k:'City',v:cs.city},{k:'Size',v:cs.sqft},{k:'Delivered in',v:cs.days}],
  cardsSection:{eyebrow:'Rooms delivered',h2:'Every room, one accountable team.',cols:3,items:cs.rooms.map(r=>({art:r.art,title:r.title,body:'See how we approach '+r.title.toLowerCase()+' across every Homworks home.',href:r.href,linkLabel:'Explore'}))},
  testimonial:cs,
  cta:{h2:'Want a home like this one?',body:'Book a free consultation and tell your designer which parts of this story you loved.',formType:'consultation'}
 };
}

/* ===== PAGES content map — Interiors pillar ===== */
const PAGES={
interiors:{title:'Interior Design Ideas for Every Room',top:true,
 metaDesc:'Explore Homworks full home interiors, modular kitchens, living rooms, bedrooms and units — designed around your family.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors'}],
 hero:{style:'photo',art:'living',duo:'duo-deep',kicker:"Interiors / Est. 2012",h1:'Every room,<br>considered.',copy:"From a full home to a single wardrobe wall — explore interior design shaped for Indian homes, Indian families and your everyday rituals.",
 stats:[{n:'18',l:'room & unit pages'},{n:'6',l:'kitchen layouts'},{n:'10-yr',l:'warranty'}],
 panel:{title:'Find your room'},
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See real projects',href:'projects.html'}]},
 cardsSection:{eyebrow:'Browse by room',h2:'Find the space that fits your life.',cols:3,items:[
  {art:'villa',tag:'Complete',title:'Full Home Interiors',body:'Design-to-installation for the whole home, from one accountable team.',href:'full-home-interiors.html'},
  {art:'kitchen',tag:'Most loved',title:'Modular Kitchens',body:'Six engineered layouts — pick the one that fits how you cook.',href:'modular-kitchens.html'},
  {art:'living',tag:'Gather',title:'Living Rooms',body:'Sofa walls, storage and TV units that fit family life.',href:'living-rooms.html'},
  {art:'bedroom',tag:'Rest',title:'Bedrooms',body:'Restful layouts, from master suites to kids rooms.',href:'bedrooms.html'},
  {art:'tv',tag:'Focus',title:'TV Units',body:'Media walls built around the way your family actually watches.',href:'tv-units.html'},
  {art:'wardrobe',tag:'Storage',title:'Wardrobes',body:'Sliding, hinged or walk-in — storage that fits two lives, not one.',href:'wardrobes.html'},
  {art:'storage',tag:'Tidy',title:'Shoe & Crockery Units',body:'Dedicated storage for the things that usually end up everywhere else.',href:'shoe-crockery-units.html'},
  {art:'pooja',tag:'Rooted',title:'Foyer & Pooja Units',body:'Vastu-aware design that gives tradition a considered place at home.',href:'foyer-pooja-units.html'},
  {art:'design',tag:'Style',title:'Design Styles',body:'Modern, contemporary or traditional — a palette that feels like you.',href:'design-styles.html'}
 ]},
 carousel:{eyebrow:'Explore by layout',h2:'Six ways to lay out a kitchen.',dur:30,items:KITCHEN_LAYOUTS.map(l=>({art:'kitchen',small:'Layout',title:l.name,href:'kitchen-'+l.slug+'.html'}))},
 faq:{eyebrow:'Questions',h2:'Before you start',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[1],FAQ_GLOBAL[2],FAQ_GLOBAL[3]]},
 cta:{h2:'Not sure where to start?',body:'Tell a designer what you have in mind — free, no pressure, within 24 hours.',formType:'consultation'}
},
'full-home-interiors':{title:'Full Home Interiors',
 metaDesc:'Full home interior design and installation by Homworks — one accountable team, one 10-year warranty.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Full Home Interiors'}],
 hero:{style:'photo',art:'villa',duo:'duo-ink',kicker:'Interiors / Full Home',h1:'Your whole home,<br>beautifully joined up.',copy:'A single Homworks team designs, manufactures and installs every room — so the smallest details add up to a home that works as one.',
 stats:[{n:'14,000+',l:'happy homes'},{n:'1',l:'accountable team'},{n:'10-yr',l:'warranty'}],
 cluster:[{art:'kitchen',icon:'grid',title:'Kitchen',sub:'Start here',href:'modular-kitchens.html'},{art:'bedroom',icon:'bed',title:'Bedroom',sub:'Start here',href:'bedrooms.html'},{art:'living',icon:'sofa',title:'Living',sub:'Start here',href:'living-rooms.html'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See full-home projects',href:'projects.html'}]},
 intro:{eyebrow:'One vision. One accountable team.',h2:'Nothing gets lost between rooms.',body:'Most interior projects fall apart at the handoffs — one vendor for the kitchen, another for wardrobes, a third for the civil work. Homworks designs, manufactures and installs every room as one project, with one project manager end to end.',link:{label:'See how it works',href:'how-it-works.html'}},
 cardsSection:{eyebrow:'The journey',h2:'Six stages, one team.',cols:3,items:[
  {art:'process',tag:'01',title:'Design consultation',body:'A free session to understand your rooms, budget and timeline.',href:'book-consultation.html'},
  {art:'design',tag:'02',title:'3D visualisation',body:'See your whole home before you commit to anything.',href:'get-a-quote.html'},
  {art:'process',tag:'03',title:'Factory production',body:'Every module made and quality-checked in our own factory.',href:'quality-factory.html'},
  {art:'villa',tag:'04',title:'Installation & handover',body:'Our own installation team, with a fixed 30-day promise on qualifying projects.',href:'30-day-delivery.html'},
  {art:'care',tag:'05',title:'10-year warranty',body:'Covering cabinetry, carcass and mechanisms across every room.',href:'warranty-after-sales.html'},
  {art:'care',tag:'06',title:'Post-installation care',body:'A dedicated after-sales team for anything that needs a visit.',href:'customer-portal.html'}
 ]},
 steps:{eyebrow:'The Homworks way',h2:'Beautifully uncomplicated.',note:'One team. One transparent plan. A home that comes together in exactly the right order.',items:[
  {tag:'DREAM',title:'Tell us your story',body:'A free, no-pressure conversation about your home, hopes and budget.'},
  {tag:'DESIGN',title:'See it before it exists',body:'Your designer turns your brief into a detailed 3D vision and fixed quote.'},
  {tag:'MAKE',title:'Made with intent',body:'Precision-made modules, quality-checked 100 times before they leave us.'},
  {tag:'DELIVER',title:'Watch it come alive',body:'A dedicated project manager coordinates every last detail, on schedule.'},
  {tag:'BELONG',title:'Live happily ever after',body:'Move in with a 10-year warranty and care that stays with you.'}
 ]},
 testimonial:{quote:"They understood not just our Pinterest board, but the way our family actually lives.",name:'Meera & Arjun',role:'Villa, Coimbatore'},
 faq:{eyebrow:'Questions',h2:'Full home FAQs',items:[FAQ_GLOBAL[1],FAQ_GLOBAL[2],FAQ_GLOBAL[5]]},
 cta:{h2:'Make your whole home work beautifully.',body:'Book a free consultation and get a fixed, itemised quote for every room.',formType:'consultation',label:'Start your project'}
},
'modular-kitchens':{title:'Modular Kitchen Designs & Layouts',top:true,
 metaDesc:'Modular kitchen designs and layouts by Homworks — L-shaped, U-shaped, galley, one-wall, peninsular and island kitchens.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Modular Kitchens'}],
 hero:{style:'photo',art:'kitchen',duo:'duo-terra',kicker:'Interiors / Modular Kitchens',h1:'The kitchen<br>where life gathers.',copy:'Engineered layouts, durable finishes and storage that keeps the everyday flowing — pick the layout that fits your home.',
 stats:[{n:'6',l:'layouts to choose from'},{n:'100+',l:'quality checks'},{n:'10-yr',l:'warranty'}],
 panel:{title:'Find your layout',roomLabel:'Home size',rooms:['1BHK / Studio','2BHK','3BHK','4BHK+'],cta:'Show my fit'},
 ctas:[{label:'Get a kitchen quote',form:'quote',primary:true},{label:'See kitchen projects',href:'projects.html'}]},
 intro:{eyebrow:'Good cooking starts with a smarter layout',h2:'Six layouts. One right answer for your home.',body:'Every kitchen we build starts with your floor plan, not a catalogue page. Below are the six layouts our designers work with most — explore each to see which fits your home, your budget and the way you actually cook.'},
 cardsSection:{eyebrow:'Choose a layout',h2:'Six ways to lay out a kitchen.',cols:3,items:KITCHEN_LAYOUTS.map((l,i)=>({art:'kitchen',tag:'Layout 0'+(i+1),title:l.name+' Kitchen',body:l.blurb,href:'kitchen-'+l.slug+'.html'}))},
 testimonialsSection:{eyebrow:'From the kitchen',h2:'What homeowners tell us.',items:[
  {q:"Every small concern was answered before it became a problem. That is rare.",name:'Vignesh Kumar',meta:'L-Shaped kitchen, Chennai'},
  {q:"The corner storage alone changed how we use the kitchen every single day.",name:'Radhika Nair',meta:'U-Shaped kitchen, Bangalore'},
  {q:"They fit an island into a space we thought was too small. It works perfectly.",name:'Karthik & Divya',meta:'Island kitchen, Coimbatore'}
 ]},
 faq:{eyebrow:'Questions',h2:'Modular kitchen FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[1],FAQ_GLOBAL[2]]},
 cta:{h2:"Let's plan your perfect kitchen.",body:'Book a free consultation and meet a kitchen designer within 24 hours.',formType:'quote',label:'Meet a kitchen designer'}
},
'living-rooms':{title:'Living Room Interior Designs',
 metaDesc:'Living room and TV unit interior designs by Homworks — sofa walls, storage and lighting for the way you gather.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Living Rooms'}],
 hero:{style:'photo',art:'living',duo:'duo-deep',kicker:'Interiors / Living Rooms',h1:'Comfort,<br>made considered.',copy:'Living room interiors that make a statement without losing the comfort, storage and everyday ease a real family needs.',
 stats:[{n:'14,000+',l:'happy homes'},{n:'6',l:'design styles'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See living room projects',href:'projects.html'}]},
 intro:{eyebrow:'The room that does the most',h2:'Built for how your family actually gathers.',body:'A living room has to work for movie nights, guests dropping by, kids doing homework and everything in between. Our designers plan storage, seating and lighting around your real routines — not a showroom mockup.'},
 cardsSection:{eyebrow:'Explore',h2:'Everything a living room needs.',cols:3,items:[
  {art:'tv',tag:'Focus',title:'TV Units',body:'Media walls sized to your room and your screen, with cable management built in.',href:'tv-units.html'},
  {art:'design',tag:'Style',title:'Sofa walls & seating',body:'Layouts that keep conversation easy, whatever the room shape.',href:'design-styles.html'},
  {art:'design',tag:'Ambience',title:'Lighting plans',body:'Layered lighting that shifts from bright and social to quiet and calm.',href:'design-styles.html'},
  {art:'storage',tag:'Storage',title:'Storage walls',body:'Closed storage that keeps the room feeling calm, not cluttered.',href:'shoe-crockery-units.html'},
  {art:'design',tag:'Finish',title:'False ceilings',body:'Ceiling designs that add height and hide the wiring, cleanly.',href:'design-styles.html'},
  {art:'storage',tag:'Display',title:'Crockery & display units',body:'A place for the pieces you actually want on show.',href:'shoe-crockery-units.html'}
 ]},
 testimonialsSection:{eyebrow:'From the living room',h2:'What homeowners tell us.',items:[
  {q:"It feels polished, but it also feels like us. We did not know both were possible.",name:'Aditi Shah',meta:'2BHK, Bangalore'},
  {q:"The TV wall is the first thing every guest asks about.",name:'Rohan Mehta',meta:'3BHK, Hyderabad'}
 ]},
 faq:{eyebrow:'Questions',h2:'Living room FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[2],FAQ_GLOBAL[5]]},
 cta:{h2:'Create a room everyone loves.',body:'Book a free consultation and get a fixed quote for your living room.',formType:'consultation',label:'Talk to a designer'}
},
bedrooms:{title:'Bedroom & Wardrobe Interior Designs',
 metaDesc:'Bedroom and wardrobe interior designs by Homworks — calmer layouts and storage that fits two lives.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Bedrooms'}],
 hero:{style:'photo',art:'bedroom',duo:'duo-plum',kicker:'Interiors / Bedrooms',h1:'A better start<br>and end to every day.',copy:'Bedroom interiors with calmer corners, clever wardrobes and a place for every version of you.',
 stats:[{n:'14,000+',l:'happy homes'},{n:'3',l:'wardrobe styles'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Plan my bedroom',form:'consultation',primary:true},{label:'See bedroom projects',href:'projects.html'}]},
 intro:{eyebrow:'Designed for daily reset',h2:'Rest, storage and a little bit of calm.',body:'A bedroom is the one room that has to work quietly, every single day. We plan wardrobes first — the single biggest factor in whether a bedroom feels calm or cluttered — then build the rest of the room around it.'},
 cardsSection:{eyebrow:'Explore',h2:'Every bedroom, considered.',cols:3,items:[
  {art:'bedroom',tag:'Rest',title:'Master bedrooms',body:'Restful palettes and layouts built around how you actually sleep and get ready.',href:'wardrobes.html'},
  {art:'bedroom',tag:'Grow',title:"Kids' bedrooms",body:'Storage and layouts that can grow with your child, not just their toys.',href:'wardrobes.html'},
  {art:'wardrobe',tag:'Storage',title:'Walk-in wardrobes',body:'A dedicated dressing space, where floor area allows.',href:'wardrobes.html'},
  {art:'wardrobe',tag:'Storage',title:'Sliding wardrobes',body:'The space-efficient choice for smaller bedrooms.',href:'wardrobes.html'},
  {art:'design',tag:'Focus',title:'Study corners',body:'A quiet, dedicated corner for work or study, folded into the room.',href:'design-styles.html'},
  {art:'storage',tag:'Storage',title:'Dressers & storage',body:'Extra storage for the things wardrobes were never meant to hold.',href:'shoe-crockery-units.html'}
 ]},
 faq:{eyebrow:'Questions',h2:'Bedroom FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[2],FAQ_GLOBAL[3]]},
 cta:{h2:'Make space for better rest.',body:'Book a free consultation and get a fixed quote for your bedroom.',formType:'consultation',label:'Talk to a designer'}
},
'tv-units':{title:'TV Unit Designs',
 metaDesc:'TV unit and media wall designs by Homworks — built around your room, your screen and how you actually watch.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'TV Units'}],
 hero:{style:'art',art:'tv',duo:'duo-deep',kicker:'Interiors / TV Units',h1:'A wall built<br>around the screen.',copy:'Media walls sized to your room and your screen, with storage and cable management designed in from the start.',
 stats:[{n:'3',l:'unit styles'},{n:'10-yr',l:'warranty'},{n:'30-day',l:'delivery*'}],
 ctas:[{label:'Get a quote',form:'quote',primary:true},{label:'See living rooms',href:'living-rooms.html'}]},
 intro:{eyebrow:'More than a shelf for the TV',h2:'Storage, lighting and cable management in one wall.',body:'A good TV unit hides the mess — routers, set-top boxes, gaming consoles — while still looking considered. We plan viewing distance, storage and ambient lighting together, not as an afterthought.'},
 cardsSection:{eyebrow:'Choose a style',h2:'Four ways to build a media wall.',flat:true,cols:2,items:[
  {tag:'01',title:'Floating panel unit',body:'A wall-mounted panel with concealed wiring — the cleanest, most modern look.'},
  {tag:'02',title:'Full-height storage wall',body:'Combines the TV unit with tall storage either side, for living rooms that need the extra space.'},
  {tag:'03',title:'Low console unit',body:'A classic low unit with open and closed storage, works with any room style.'},
  {tag:'04',title:'Feature wall with lighting',body:'Backlighting and textured panelling that makes the TV wall the room\'s focal point.'}
 ]},
 faq:{eyebrow:'Questions',h2:'TV unit FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[3]]},
 cta:{h2:'Design your media wall.',body:'Book a free consultation and see 3D options for your living room.',formType:'quote'}
},
wardrobes:{title:'Wardrobe Designs',
 metaDesc:'Wardrobe designs by Homworks — sliding, hinged and walk-in wardrobes with a 10-year warranty.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Wardrobes'}],
 hero:{style:'art',art:'wardrobe',duo:'duo-plum',kicker:'Interiors / Wardrobes',h1:'Storage that fits<br>two lives, not one.',copy:'Sliding, hinged or walk-in — wardrobe interiors planned around what you actually own, not a standard module size.',
 stats:[{n:'3',l:'wardrobe types'},{n:'10-yr',l:'warranty'},{n:'100+',l:'quality checks'}],
 ctas:[{label:'Get a quote',form:'quote',primary:true},{label:'See bedroom ideas',href:'bedrooms.html'}]},
 intro:{eyebrow:'The single biggest factor in a calm bedroom',h2:'Planned around what you own, not a template.',body:"Most wardrobe disappointment comes from planning storage before knowing what's going in it. We start with a simple conversation about how you actually dress and store, then design shelves, drawers and hanging space to match."},
 cardsSection:{eyebrow:'Choose a type',h2:'Three ways to store.',flat:true,cols:2,items:[
  {tag:'01',title:'Sliding wardrobes',body:'The most space-efficient choice — no swing radius needed, ideal for smaller bedrooms.'},
  {tag:'02',title:'Hinged wardrobes',body:'Full access to every shelf at once, and often the more budget-friendly option.'},
  {tag:'03',title:'Walk-in wardrobes',body:'A dedicated dressing room, where your bedroom has the floor area to spare.'},
  {tag:'04',title:'Loft & overhead storage',body:'Recovers the space above your wardrobe for out-of-season items.'}
 ]},
 faq:{eyebrow:'Questions',h2:'Wardrobe FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[3]]},
 cta:{h2:"Let's design your wardrobe.",body:'Book a free consultation and get a fixed quote based on what you actually need to store.',formType:'quote'}
},
'shoe-crockery-units':{title:'Shoe & Crockery Unit Designs',
 metaDesc:'Shoe and crockery unit designs by Homworks — dedicated storage for the things that usually end up everywhere else.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Shoe & Crockery Units'}],
 hero:{style:'art',art:'storage',duo:'duo-olive',kicker:'Interiors / Storage Units',h1:'A place for<br>everything else.',copy:'Dedicated shoe and crockery storage — the small units that make the biggest difference to how tidy a home feels.',
 stats:[{n:'2',l:'unit types'},{n:'10-yr',l:'warranty'},{n:'100+',l:'quality checks'}],
 ctas:[{label:'Get a quote',form:'quote',primary:true},{label:'See foyer & pooja units',href:'foyer-pooja-units.html'}]},
 intro:{eyebrow:'Small units, big difference',h2:'The storage most homes forget to plan.',body:'Shoes at the door and crockery on display both need a real, dedicated home — not a corner of a bigger cabinet. We design both as part of your full home plan, sized to what your family actually owns.'},
 cardsSection:{eyebrow:'Explore',h2:'Two units, done right.',cols:2,items:[
  {art:'storage',tag:'Entryway',title:'Shoe units',body:'Ventilated, closed storage sized for every pair your family actually owns, right at the entryway.',href:'foyer-pooja-units.html'},
  {art:'storage',tag:'Display',title:'Crockery units',body:'Open and closed storage for everyday and special-occasion crockery, sized to your kitchen or dining room.',href:'living-rooms.html'}
 ]},
 faq:{eyebrow:'Questions',h2:'Storage FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[3]]},
 cta:{h2:'Plan your storage properly.',body:'Book a free consultation and get a layout built around what you actually own.',formType:'quote'}
},
'foyer-pooja-units':{title:'Foyer & Pooja Unit Designs',
 metaDesc:'Vastu-aware foyer and pooja unit designs by Homworks for modern Indian homes.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Foyer & Pooja Units'}],
 hero:{style:'art',art:'pooja',duo:'duo-olive',kicker:'Interiors / Foyer & Pooja',h1:'Tradition,<br>given room to breathe.',copy:'Vastu-aware pooja room designs that give tradition a beautiful, considered place in your modern home.',
 stats:[{n:'6',l:'cities served'},{n:'10-yr',l:'warranty'},{n:'100+',l:'quality checks'}],
 ctas:[{label:'Get a quote',form:'quote',primary:true},{label:'Read our Vastu guide',href:'blog-post-vastu-pooja-room-design.html'}]},
 intro:{eyebrow:'Rooted in ritual',h2:'Designed after understanding your family\'s rituals.',body:'A pooja space deserves more thought than a leftover corner. Our designers plan direction, ventilation and materials around Vastu principles where they matter to your family, and around daily practicality always.'},
 cardsSection:{eyebrow:'What we consider',h2:'Every detail, considered.',flat:true,cols:2,items:[
  {tag:'01',title:'Direction & placement',body:'Oriented for east or north-facing prayer where your home\'s layout allows.'},
  {tag:'02',title:'Ventilation',body:'Real airflow, even a small jali panel, to keep smoke from settling into the home.'},
  {tag:'03',title:'Traditional materials',body:'Teak, sheesham, brass hardware and stone bases, chosen for durability as much as meaning.'},
  {tag:'04',title:'Foyer integration',body:'A welcoming entryway unit that can double as a pooja corner in compact homes.'}
 ]},
 faq:{eyebrow:'Questions',h2:'Foyer & pooja FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[4]]},
 cta:{h2:'Give tradition its place.',body:'Book a free consultation and talk through Vastu-aware options for your home.',formType:'quote'}
},
'design-styles':{title:'Interior Design Styles',
 metaDesc:'Explore interior design styles by Homworks — modern, contemporary, traditional and transitional palettes.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Interiors',h:'interiors.html'},{l:'Design Styles'}],
 hero:{style:'art',art:'design',duo:'duo-terra',kicker:'Interiors / Design Styles',h1:'A palette<br>that feels like you.',copy:'Modern, contemporary or traditional — every Homworks project starts with a style conversation, not a fixed catalogue.',
 stats:[{n:'4',l:'core styles'},{n:'14,000+',l:'happy homes'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See real projects',href:'projects.html'}]},
 intro:{eyebrow:'Style, without the guesswork',h2:'Four starting points, endlessly personalised.',body:'Most homeowners recognise a style when they see it, but struggle to name it. Our designers use these four families as a starting conversation — then personalise materials, colour and detail to your specific home.'},
 cardsSection:{eyebrow:'Explore',h2:'Four design families.',flat:true,cols:2,items:[
  {tag:'01',title:'Modern minimal',body:'Clean lines, handleless cabinetry and a restrained, neutral palette.'},
  {tag:'02',title:'Warm contemporary',body:'Modern shapes softened with warm wood tones and textured finishes.'},
  {tag:'03',title:'Traditional Indian',body:'Rich materials, detailed hardware and space for ritual and heritage.'},
  {tag:'04',title:'Transitional',body:'A considered mix of traditional warmth and modern function.'}
 ]},
 faq:{eyebrow:'Questions',h2:'Design style FAQs',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[5]]},
 cta:{h2:'Find your style.',body:'Book a free consultation — your designer will help you find a palette that fits your home and your life.',formType:'consultation'}
},

/* ===== Projects pillar ===== */
projects:{title:'Project Gallery',top:true,
 metaDesc:'Explore real Homworks interior design projects and customer stories, filtered by city and room.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Projects'}],
 type:'gallery',
 hero:{style:'photo',art:'design',duo:'duo-deep',kicker:'Projects',h1:'Built for<br>real lives.',copy:'See the details, materials and stories behind Homworks homes across India. Filter by city, room or the kind of life you are making space for.',
 stats:[{n:'14,000+',l:'homes delivered'},{n:'6',l:'cities'},{n:'4.9/5',l:'homeowner love'}],
 chips:{names:['Meera Arjun','Vignesh Kumar','Aditi Shah'],label:'Real homeowners, real homes'},
 ctas:[{label:'Book a show-home visit',form:'visit',primary:true},{label:'Read customer stories',href:'customer-stories.html'}]},
 testimonialsSection:{eyebrow:'The good kind of proof',h2:'Homes people cannot wait to come back to.',items:[
  {q:"They understood not just our Pinterest board, but the way our family actually lives.",name:'Meera & Arjun',meta:'3BHK, Bangalore'},
  {q:"Every small concern was answered before it became a problem. That is rare.",name:'Vignesh Kumar',meta:'Villa, Coimbatore'},
  {q:"It feels polished, but it also feels like us. We did not know both were possible.",name:'Aditi Shah',meta:'2BHK, Chennai'}
 ]},
 cta:{h2:'Find a home that feels familiar.',body:'Book a free consultation and tell your designer which project caught your eye.',formType:'consultation',label:'Explore with a designer'}
},
'customer-stories':{title:'Customer Stories',
 metaDesc:'Real Homworks customer stories and reviews from homeowners across India.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Projects',h:'projects.html'},{l:'Customer Stories'}],
 hero:{style:'photo',art:'care',duo:'duo-terra',kicker:'Projects / Customer Stories',h1:'In their<br>own words.',copy:'Thousands of homeowners have trusted Homworks with their homes. Here is what they told us, unedited.',
 stats:[{n:'14,000+',l:'happy homes'},{n:'4.9/5',l:'average rating'},{n:'6',l:'cities'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See the projects',href:'projects.html'}]},
 testimonialsSection:{eyebrow:'Reviews',h2:'Homeowners, in their own words.',items:[
  {q:"They understood not just our Pinterest board, but the way our family actually lives.",name:'Meera & Arjun',meta:'3BHK, Bangalore'},
  {q:"Every small concern was answered before it became a problem. That is rare.",name:'Vignesh Kumar',meta:'Villa, Coimbatore'},
  {q:"It feels polished, but it also feels like us. We did not know both were possible.",name:'Aditi Shah',meta:'2BHK, Chennai'},
  {q:"The corner storage alone changed how we use the kitchen every single day.",name:'Radhika Nair',meta:'U-Shaped kitchen, Bangalore'},
  {q:"They fit an island into a space we thought was too small. It works perfectly.",name:'Karthik & Divya',meta:'Island kitchen, Coimbatore'},
  {q:"On-time, on-budget, and they still checked in a month after we moved in.",name:'Farhan Ali',meta:'3BHK, Hyderabad'}
 ]},
 cardsSection:{eyebrow:'See it built',h2:'The projects behind these stories.',cols:3,items:CASE_STUDIES.map(c=>({art:'villa',tag:c.city,title:c.title,body:c.brief,href:'case-study-'+c.slug+'.html'}))},
 cta:{h2:'Ready to write your own story?',body:'Book a free consultation and start with a designer who listens first.',formType:'consultation'}
},

/* ===== Why Homworks pillar ===== */
'why-homworks':{title:'Why Choose Homworks',top:true,
 metaDesc:'Why choose Homworks for end-to-end home interiors — in-house manufacturing, a 30-day delivery promise and a 10-year warranty.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Why Homworks'}],
 hero:{style:'photo',art:'process',duo:'duo-ink',kicker:'Why Homworks',h1:'Everything in-house.<br>Everything in hand.',copy:'At Homworks, design, precision manufacturing and installation move together. That means more clarity for you, and fewer loose ends in your home.',
 stats:[{n:'14,000+',l:'happy homes'},{n:'100%',l:'in-house'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See how we work',href:'how-it-works.html'}]},
 cardsSection:{eyebrow:'Our promise',h2:'Six reasons homeowners trust us.',cols:3,items:[
  {art:'process',tag:'Story',title:'About Us',body:'The story, the team and the factory behind the homes.',href:'about-us.html'},
  {art:'process',tag:'Process',title:'How It Works',body:'Five steps from first meeting to move-in day.',href:'how-it-works.html'},
  {art:'process',tag:'Promise',title:'30-Day Delivery',body:'Your home delivered in 30 days: the promise, in writing.',href:'30-day-delivery.html'},
  {art:'villa',tag:'Standard',title:'Quality & Factory',body:'Certified materials and 100+ quality checks, all in-house.',href:'quality-factory.html'},
  {art:'care',tag:'Care',title:'Warranty & After-Sales',body:'One clear warranty and a dedicated support team.',href:'warranty-after-sales.html'},
  {art:'care',tag:'Team',title:'Careers',body:'Open roles and life at Homworks.',href:'careers.html'}
 ]},
 steps:{eyebrow:'The Homworks way',h2:'Beautifully uncomplicated.',note:'One team. One transparent plan. A home that comes together in exactly the right order.',items:[
  {tag:'DREAM',title:'Tell us your story',body:'A free, no-pressure conversation about your home, hopes and budget.'},
  {tag:'DESIGN',title:'See it before it exists',body:'Your designer turns your brief into a detailed 3D vision and fixed quote.'},
  {tag:'MAKE',title:'Made with intent',body:'Precision-made modules, quality-checked 100 times before they leave us.'},
  {tag:'DELIVER',title:'Watch it come alive',body:'A dedicated project manager coordinates every last detail, on schedule.'},
  {tag:'BELONG',title:'Live happily ever after',body:'Move in with a 10-year warranty and care that stays with you.'}
 ]},
 faq:{eyebrow:'Questions',h2:'Why Homworks FAQs',items:[FAQ_GLOBAL[2],FAQ_GLOBAL[3],FAQ_GLOBAL[6]]},
 cta:{h2:'Quality you can see. Care you can count on.',body:'Book a free consultation and see how the Homworks process feels different.',formType:'consultation',label:'See how we work'}
},
'about-us':{title:'About Homworks',
 metaDesc:'Homworks is a team of designers, makers and project experts building end-to-end home interiors across six Indian cities.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Why Homworks',h:'why-homworks.html'},{l:'About Us'}],
 hero:{style:'photo',art:'team',duo:'duo-deep',kicker:'Why Homworks / About Us',h1:'Built by people<br>who make things.',copy:'Homworks is a team of designers, makers and project experts with one shared belief: your home should make everyday life better.',
 stats:[{n:'2012',l:'founded in Coimbatore'},{n:'6',l:'cities'},{n:'14,000+',l:'homes delivered'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See our careers',href:'careers.html'}]},
 intro:{eyebrow:'Our story',h2:'From one factory to six cities.',body:'Homworks (Stylcove Modulars Pvt Ltd) started in Coimbatore with a simple frustration: interior projects took too long, involved too many hand-offs, and rarely finished the way they were promised. So we built our own factory, hired our own installation teams, and kept every part of the process in-house — a model that now runs across six cities.'},
 cardsSection:{eyebrow:'What we believe',h2:'Four things we will not compromise on.',flat:true,cols:2,items:[
  {tag:'01',title:'Design-led, always',body:'Every project starts with a conversation about how you live, not a catalogue.'},
  {tag:'02',title:'In-house, end to end',body:'Design, manufacturing and installation under one accountable roof.'},
  {tag:'03',title:'Radically transparent',body:'Fixed quotes, tracked timelines and no surprise costs.'},
  {tag:'04',title:'Care that stays',body:'A 10-year warranty and a real after-sales team, not a hotline that goes nowhere.'}
 ]},
 carousel:{eyebrow:'Where we are',h2:'Six cities, one standard.',dur:26,items:CITIES.map(c=>({art:'city',small:c.since,title:c.name,href:'location-'+c.slug+'.html'}))},
 cta:{h2:'Come build homes with us.',body:'We are always looking for design-led people who care about the details.',mailto:'careers@homworks.com',label:'Email careers@homworks.com'}
},
'how-it-works':{title:'How Homworks Works',
 metaDesc:'How Homworks works — five simple steps from meeting a designer to moving into your finished home.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Why Homworks',h:'why-homworks.html'},{l:'How It Works'}],
 hero:{style:'art',art:'process',duo:'duo-ink',kicker:'Why Homworks / How It Works',h1:'A process that<br>removes fear.',copy:'Five simple steps, from meeting a designer to moving in, laid out plainly — no surprises, no hidden hand-offs.',
 stats:[{n:'5',l:'simple steps'},{n:'24hr',l:'first call'},{n:'30-day',l:'delivery*'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See the 30-day promise',href:'30-day-delivery.html'}]},
 steps:{eyebrow:'Step by step',h2:'From first meeting to move-in.',note:'Every stage has one accountable team — nothing gets lost in a hand-off.',items:[
  {tag:'01 MEET',title:'Talk to a designer',body:'A free, no-pressure conversation about your home, hopes and budget — by call, video or in person.'},
  {tag:'02 DESIGN',title:'See it in 3D',body:'Your designer turns your brief into a detailed 3D vision and a fixed, itemised quote.'},
  {tag:'03 SIGN OFF',title:'Approve your plan',body:'Once you approve the design and quote, your 30-day delivery clock starts.'},
  {tag:'04 MAKE & INSTALL',title:'We build it',body:'Modules are manufactured in-house, quality-checked, then installed by our own team.'},
  {tag:'05 MOVE IN',title:'Live happily ever after',body:'A final walkthrough, your 10-year warranty activated, and ongoing after-sales care.'}
 ]},
 faq:{eyebrow:'Questions',h2:'Process FAQs',items:[FAQ_GLOBAL[1],FAQ_GLOBAL[5],FAQ_GLOBAL[8]]},
 cta:{h2:'Ready for step one?',body:'Book a free consultation — a designer calls you within 24 hours.',formType:'consultation'}
},
'30-day-delivery':{title:'The 30-Day Delivery Promise',
 metaDesc:'Homworks 30-day interior delivery promise — a clear, carefully managed timeline for qualifying modular projects.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Why Homworks',h:'why-homworks.html'},{l:'30-Day Delivery'}],
 type:'delivery',
 hero:{style:'photo',art:'process',duo:'duo-terra',kicker:'Why Homworks / Our Promise',h1:'Move in,<br>on your timeline.',copy:"A clear, carefully managed 30-day delivery promise for qualifying modular interior projects. We show you what happens, when, and who owns it.",
 stats:[{n:'30',l:'days, from sign-off'},{n:'100+',l:'quality checks'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Plan my delivery',href:'delivery-planner.html',primary:true},{label:'Book free consultation',form:'consultation'}]},
 intro:{eyebrow:'What starts the clock',h2:'Day 0 is your design sign-off.',body:"The 30-day promise applies to qualifying modular interior projects, counted from the day you approve your final 3D design and fixed quote — not your first phone call. Your project manager confirms your exact, personalised timeline before you sign off."},
 faq:{eyebrow:'Questions',h2:'Delivery FAQs',items:[FAQ_GLOBAL[1],FAQ_GLOBAL[5],{q:'What happens if my project runs late?',a:"Your project manager shares regular updates throughout, and any delay is communicated proactively — with a revised date, not silence. Persistent concerns can be escalated through our grievance process."}]},
 cta:{h2:"Let's get you home on time.",body:'Build your personalised delivery timeline, or talk to Homworks directly.',formType:'consultation',label:'Talk to Homworks'}
},
'quality-factory':{title:'Quality & Factory',
 metaDesc:'Inside the Homworks factory — certified materials and 100+ quality checks, all in-house.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Why Homworks',h:'why-homworks.html'},{l:'Quality & Factory'}],
 hero:{style:'art',art:'process',duo:'duo-ink',kicker:'Why Homworks / Standards',h1:'Quality you<br>can’t see, and quality<br>you can.',copy:'Certified plywood, precision hardware and 100+ quality checks — all inside our own factory, not a third-party workshop.',
 stats:[{n:'100+',l:'quality checkpoints'},{n:'1',l:'own factory'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'See our warranty',href:'warranty-after-sales.html'}]},
 cardsSection:{eyebrow:'What goes into every module',h2:'Four standards we never skip.',flat:true,cols:2,items:[
  {tag:'01',title:'Certified plywood & boards',body:'Moisture-resistant, certified materials selected for Indian climate conditions.'},
  {tag:'02',title:'Precision hardware',body:'Soft-close hinges and channels from brands built to outlast the cabinetry itself.'},
  {tag:'03',title:'100+ point quality check',body:'Every module is inspected before it ever leaves our factory floor.'},
  {tag:'04',title:'One factory, one standard',body:'All manufacturing happens in-house, so quality never depends on which vendor you got.'}
 ]},
 cta:{h2:'See the standard for yourself.',body:'Book a show-home visit and see finished quality up close.',formType:'visit',label:'Book a show-home visit'}
},
'warranty-after-sales':{title:'Warranty & After-Sales',
 metaDesc:'Homworks warranty terms and after-sales support — a 10-year warranty backed by a dedicated service team.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Why Homworks',h:'why-homworks.html'},{l:'Warranty & After-Sales'}],
 hero:{style:'photo',art:'care',duo:'duo-deep',kicker:'Why Homworks / Standards',h1:'Care that<br>stays with you.',copy:'Our 10-year warranty is our promise to stand behind the craftsmanship, materials and mechanisms that make up your home.',
 stats:[{n:'10-yr',l:'warranty'},{n:'24hr',l:'ticket acknowledgement'},{n:'6',l:'service centres'}],
 ctas:[{label:'Raise a service request',form:'grievance',primary:true},{label:'See the customer portal',href:'customer-portal.html'}]},
 cardsSection:{eyebrow:'What is covered',h2:'Clear terms, not fine print.',flat:true,cols:2,items:[
  {tag:'Covered',title:'Cabinetry & carcass',body:'Structural integrity of all cabinetry for 10 years from installation.'},
  {tag:'Covered',title:'Hardware & mechanisms',body:'Hinges, channels and fittings covered against manufacturing defects.'},
  {tag:'Not covered',title:'Normal wear & misuse',body:'Damage from water exposure, misuse or unauthorised modification.'},
  {tag:'Service',title:'AMC available',body:'Optional annual maintenance plans for extended peace of mind.'}
 ]},
 faq:{eyebrow:'Questions',h2:'Warranty FAQs',items:[FAQ_GLOBAL[3],FAQ_GLOBAL[7]]},
 cta:{h2:'Need help with something?',body:'Raise a request and a Homworks service team will follow up.',formType:'grievance'}
},
careers:{title:'Careers at Homworks',
 metaDesc:'Careers at Homworks — open roles in design, project management, manufacturing and customer experience across six cities.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Why Homworks',h:'why-homworks.html'},{l:'Careers'}],
 hero:{style:'photo',art:'team',duo:'duo-olive',kicker:'Why Homworks / Careers',h1:'Come create homes<br>that matter.',copy:'Explore opportunities for designers, project managers, manufacturing experts and more — across six growing cities.',
 stats:[{n:'6',l:'cities hiring'},{n:'2012',l:'founded'},{n:'14,000+',l:'homes built together'}],
 ctas:[{label:'Send your CV',href:'mailto:careers@homworks.com',primary:true},{label:'Read about us',href:'about-us.html'}]},
 cardsSection:{eyebrow:'Where you could work',h2:'Four teams, always hiring.',cols:2,items:[
  {art:'design',tag:'Design',title:'Design careers',body:'Interior designers who listen first and sketch second.',href:'mailto:careers@homworks.com'},
  {art:'process',tag:'Delivery',title:'Project management',body:'Coordinators who keep every stage on schedule and every customer informed.',href:'mailto:careers@homworks.com'},
  {art:'villa',tag:'Factory',title:'Manufacturing & factory',body:'Precision production, quality checks and installation teams.',href:'mailto:careers@homworks.com'},
  {art:'care',tag:'Support',title:'Customer experience',body:'The people who make sure every question gets a real answer.',href:'mailto:careers@homworks.com'}
 ]},
 testimonialsSection:{eyebrow:'Life at Homworks',h2:'What the team says.',items:[
  {q:"I get to see a family's reaction the day they move in. That never gets old.",name:'Priya Ramesh',meta:'Design Lead, Coimbatore'},
  {q:"We fix problems before the customer even notices them. That is the standard here.",name:'Suresh Babu',meta:'Project Manager, Chennai'}
 ]},
 cta:{h2:'Ready to build with us?',body:'Send your CV and a little about the kind of work you want to do.',mailto:'careers@homworks.com',label:'Email careers@homworks.com'}
},

/* ===== Locations pillar ===== */
locations:{title:'Homworks Interior Design Centres',top:true,
 metaDesc:'Homworks interior design centres in Coimbatore, Chennai, Bangalore, Erode, Hyderabad and Guwahati.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Locations'}],
 type:'locations-hub',
 hero:{style:'photo',art:'city',duo:'duo-ink',kicker:'Locations',h1:'A Homworks<br>centre near you.',copy:'Meet a designer, touch materials and see what quality feels like at one of our six centres.',
 stats:[{n:'6',l:'cities'},{n:'14,000+',l:'homes delivered'},{n:'10-yr',l:'warranty everywhere'}],
 panel:{title:'Book a visit',roomLabel:'Choose a centre',rooms:CITY_NAMES,cta:'Book my visit'},
 ctas:[{label:'Book a show-home visit',form:'visit',primary:true},{label:'Call 1800 121 3110',href:'tel:18001213110'}]},
 cta:{h2:'Find your nearest Homworks team.',body:'Book a visit and see, touch and experience a finished Homworks interior.',formType:'visit',label:'Plan a visit'}
},

/* ===== Resources pillar ===== */
resources:{title:'Homworks Resources & Guides',top:true,
 metaDesc:'Homworks interior design guides, planners and frequently asked questions.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Resources'}],
 hero:{style:'photo',art:'design',duo:'duo-deep',kicker:'Resources',h1:'Good decisions<br>start with good questions.',copy:'Use our design guides, delivery planner and practical tools to make your home project feel less overwhelming.',
 stats:[{n:'6',l:'guide categories'},{n:'30',l:'days, planned for you'},{n:'10',l:'FAQs answered'}],
 ctas:[{label:'Plan my 30 days',href:'delivery-planner.html',primary:true},{label:'Read the blog',href:'blog.html'}]},
 cardsSection:{eyebrow:'Tools & guides',h2:'Everything to plan with confidence.',cols:4,items:[
  {art:'blog',tag:'Read',title:'Blog',body:'Guides on kitchens, bedrooms, storage, planning and trends.',href:'blog.html'},
  {art:'process',tag:'Tool',title:'Delivery Planner',body:'Pick your rooms and city, see your 30-day timeline.',href:'delivery-planner.html'},
  {art:'storage',tag:'Download',title:'Brochure',body:'Our design guide and finishes catalogue, by email.',href:'brochure.html'},
  {art:'care',tag:'Answers',title:'FAQs',body:'Straight answers on pricing, timelines and warranty.',href:'faqs.html'}
 ]},
 carousel:{eyebrow:'Browse by topic',h2:'Six guide categories.',dur:26,items:BLOG_CATEGORIES.map(c=>({art:c.art,small:'Guides',title:c.name,href:'blog-'+c.slug+'.html'}))},
 faq:{eyebrow:'Questions',h2:'Quick answers',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[1],FAQ_GLOBAL[6]]},
 cta:{h2:'Have a question about your home?',body:'Book a free consultation and ask a designer directly.',formType:'consultation',label:'Ask a designer'}
},
blog:{title:'The Homworks Blog',
 metaDesc:'Interior design guides and ideas from Homworks — kitchens, bedrooms, living rooms, storage, planning and trends.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Resources',h:'resources.html'},{l:'Blog'}],
 hero:{style:'photo',art:'blog',duo:'duo-deep',kicker:'Resources / Blog',h1:'Ideas for a home<br>that works.',copy:'Practical, specific guides from Homworks designers — not generic decor inspiration.',
 stats:[{n:'6',l:'topic hubs'},{n:'2-4',l:'new guides a month'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Plan my 30 days',href:'delivery-planner.html',primary:true},{label:'Book free consultation',form:'consultation'}]},
 cardsSection:{eyebrow:'Latest guides',h2:'Start reading.',cols:3,items:BLOG_POSTS.map(p=>({art:p.art,tag:p.read,title:p.title,body:p.excerpt,href:'blog-post-'+p.slug+'.html'}))},
 carousel:{eyebrow:'Browse by topic',h2:'Six topic hubs.',dur:26,items:BLOG_CATEGORIES.map(c=>({art:c.art,small:'Hub',title:c.name,href:'blog-'+c.slug+'.html'}))},
 cta:{h2:'Get the full brochure.',body:'Our design guide and finishes catalogue, sent straight to your inbox.',formType:'brochure',label:'Download brochure'}
},
'delivery-planner':{title:'Delivery Planner',
 metaDesc:'Plan your home interiors delivery timeline with the Homworks delivery planner.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Resources',h:'resources.html'},{l:'Delivery Planner'}],
 type:'planner',
 hero:{style:'photo',art:'process',duo:'duo-terra',kicker:'Resources / Delivery Planner',h1:'Know your way<br>to move-in day.',copy:'Pick your room priorities and city. We will sketch a practical, realistic route to your new home.',
 stats:[{n:'30',l:'day promise*'},{n:'100+',l:'quality checks'},{n:'6',l:'cities'}],
 ctas:[{label:'Meet a designer',form:'consultation',primary:true},{label:'Read the 30-day promise',href:'30-day-delivery.html'}]},
 faq:{eyebrow:'Questions',h2:'Planner FAQs',items:[FAQ_GLOBAL[1],{q:'Is this timeline guaranteed?',a:'This planner gives a realistic estimate based on typical projects. Your exact, guaranteed timeline is confirmed by your project manager after design sign-off.'}]},
 cta:{h2:'Ready to make a timeline real?',body:'Book a free consultation and turn this plan into a fixed quote.',formType:'consultation',label:'Meet a designer'}
},
brochure:{title:'Download the Homworks Brochure',
 metaDesc:'Download the Homworks design guide and finishes brochure.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Resources',h:'resources.html'},{l:'Brochure'}],
 hero:{style:'photo',art:'design',duo:'duo-ink',kicker:'Resources / Brochure',h1:'The Homworks<br>brochure.',copy:'Our full design guide, finish options and process, in one place — sent straight to your inbox.',
 stats:[{n:'40+',l:'pages of ideas'},{n:'6',l:'design styles'},{n:'10-yr',l:'warranty'}],
 ctas:[{label:'Get the brochure',form:'brochure',primary:true},{label:'Talk to a designer instead',form:'consultation'}]},
 cardsSection:{eyebrow:"What's inside",h2:"Four things you'll find.",flat:true,cols:2,items:[
  {tag:'01',title:'Room-by-room ideas',body:'Layouts and inspiration for kitchens, bedrooms, living rooms and units.'},
  {tag:'02',title:'Finishes & materials',body:'Every material and hardware option we manufacture with, explained.'},
  {tag:'03',title:'Our process',body:'Exactly how a Homworks project moves from consultation to move-in.'},
  {tag:'04',title:'Pricing guidance',body:'A clear starting point for budgeting your project.'}
 ]},
 cta:{h2:'Prefer to talk instead?',body:'Book a free consultation and skip straight to a fixed quote.',formType:'consultation'}
},
faqs:{title:'Frequently Asked Questions',
 metaDesc:'Answers to common questions about Homworks pricing, timelines, warranty, cities and process.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Resources',h:'resources.html'},{l:'FAQs'}],
 hero:{style:'art',art:'studio',duo:'duo-ink',kicker:'Resources / FAQs',h1:'Frequently asked<br>questions.',copy:'Straight answers about pricing, timelines, warranty and how the Homworks process works.',ctas:[{label:'Still have a question?',form:'consultation',primary:true}]},
 faqGroups:[
  {eyebrow:'Pricing & timelines',h2:'Cost, budget and how long it takes',items:[FAQ_GLOBAL[0],FAQ_GLOBAL[1],FAQ_GLOBAL[6]]},
  {eyebrow:'Quality & warranty',h2:'Materials, manufacturing and after-care',items:[FAQ_GLOBAL[2],FAQ_GLOBAL[3],FAQ_GLOBAL[8]]},
  {eyebrow:'Process & support',h2:'Cities, changes and complaints',items:[FAQ_GLOBAL[4],FAQ_GLOBAL[5],FAQ_GLOBAL[7],FAQ_GLOBAL[9]]}
 ],
 cta:{h2:'Still have a question?',body:'A free consultation is the fastest way to get an answer specific to your home.',formType:'consultation'}
},

/* ===== Contact pillar ===== */
contact:{title:'Contact Homworks',top:true,
 metaDesc:'Contact Homworks for a free interior design consultation, quote, show-home visit or to raise a grievance.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Contact'}],
 hero:{style:'photo',art:'studio',duo:'duo-ink',kicker:'Contact',h1:'There is more than<br>one way to begin.',copy:'Talk to a designer, request a quote, visit a show home or raise a concern. We make sure the right Homworks team gets back to you.',
 stats:[{n:'24hr',l:'first response'},{n:'6',l:'cities'},{n:'1800',l:'toll-free'}],
 ctas:[{label:'Book free consultation',form:'consultation',primary:true},{label:'Call 1800 121 3110',href:'tel:18001213110'}]},
 cardsSection:{eyebrow:'Four ways to reach us',h2:'Pick what fits.',cols:4,items:[
  {art:'process',tag:'Free',title:'Book a Consultation',body:'Meet a designer and get personalised ideas.',form:'consultation'},
  {art:'design',tag:'Quote',title:'Get a Quote',body:'Room, city and move-in date, routed to your nearest team.',form:'quote'},
  {art:'villa',tag:'Visit',title:'Show Home Visit',body:'See, touch and experience it in a centre near you.',form:'visit'},
  {art:'care',tag:'Support',title:'Grievance Redressal',body:'Raise a concern and track it to resolution.',form:'grievance'}
 ]},
 faq:{eyebrow:'Questions',h2:'Before you reach out',items:[FAQ_GLOBAL[9],FAQ_GLOBAL[4],FAQ_GLOBAL[7]]},
 cta:{h2:'We are ready when you are.',body:'Email us directly, or start with a free consultation.',mailto:'enquiry@homworks.com',label:'Email Homworks'}
},
'book-consultation':{title:'Book a Free Consultation',
 metaDesc:'Book a free interior design consultation with a Homworks designer.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Contact',h:'contact.html'},{l:'Book a Consultation'}],
 hero:{style:'photo',art:'studio',duo:'duo-deep',kicker:'Contact / Free Consultation',h1:'Meet your<br>designer, first.',copy:'A free, no-pressure conversation about your home, your budget and what you are hoping for — the first step in every Homworks project.',
 stats:[{n:'24hr',l:'designer calls you'},{n:'0',l:'cost or obligation'},{n:'30-45',l:'min, typical call'}],
 ctas:[{label:'Book my free consultation',form:'consultation',primary:true},{label:'Call 1800 121 3110',href:'tel:18001213110'}]},
 cardsSection:{eyebrow:'What to expect',h2:'Three things happen on the call.',flat:true,cols:3,items:[
  {tag:'01',title:'We listen first',body:'Your designer asks about your home, your family and how you actually live in it.'},
  {tag:'02',title:'We talk budget honestly',body:'A realistic range for your home size and finish level, no pressure to commit.'},
  {tag:'03',title:'We agree next steps',body:'Usually a site visit or video walkthrough, followed by your 3D design.'}
 ]},
 cta:{h2:'Ready when you are.',body:'It takes two minutes to book — a designer calls within 24 hours.',formType:'consultation',label:'Book my consultation'}
},
'get-a-quote':{title:'Get a Detailed Quote',
 metaDesc:'Get a detailed, fixed interior design quote from Homworks.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Contact',h:'contact.html'},{l:'Get a Quote'}],
 hero:{style:'photo',art:'studio',duo:'duo-terra',kicker:'Contact / Get a Quote',h1:'A number<br>you can plan around.',copy:'Tell us your rooms, city and move-in date. We route this straight to your nearest team for a fixed, itemised quote.',
 stats:[{n:'0',l:'hidden costs'},{n:'24hr',l:'first response'},{n:'6',l:'cities'}],
 ctas:[{label:'Get my quote',form:'quote',primary:true},{label:'Plan my 30 days',href:'delivery-planner.html'}]},
 cardsSection:{eyebrow:'What affects your quote',h2:'Three things we ask about.',flat:true,cols:3,items:[
  {tag:'Size',title:'Home size',body:'A 2BHK, 3BHK or villa naturally shapes your starting budget.'},
  {tag:'Finish',title:'Finish level',body:'Classic, premium or signature materials and hardware.'},
  {tag:'Rooms',title:'Which rooms',body:'Full home or specific rooms — your quote reflects exactly what you need.'}
 ]},
 cta:{h2:'Get a number you can trust.',body:'Fixed, itemised and confirmed before any work begins.',formType:'quote'}
},
'show-home-visit':{title:'Book a Show-Home Visit',
 metaDesc:'Book a show-home visit at a Homworks centre near you.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Contact',h:'contact.html'},{l:'Show Home Visit'}],
 hero:{style:'photo',art:'villa',duo:'duo-ink',kicker:'Contact / Show Home Visit',h1:'See. Touch.<br>Experience.',copy:'Walk through a finished Homworks interior before you decide on anything. Six centres, one standard.',
 stats:[{n:'6',l:'centres'},{n:'7',l:'days a week'},{n:'0',l:'cost to visit'}],
 panel:{title:'Pick a centre',roomLabel:'Choose a centre',rooms:CITY_NAMES,cta:'Book my visit'},
 ctas:[{label:'Book my visit',form:'visit',primary:true},{label:'Call 1800 121 3110',href:'tel:18001213110'}]},
 cardsSection:{eyebrow:'Our centres',h2:'Pick the one nearest you.',cols:3,items:CITIES.map(c=>({art:'city',tag:c.tag,title:c.name,body:c.blurb,href:'location-'+c.slug+'.html'}))},
 cta:{h2:'See what quality feels like.',body:'Book a visit and meet a designer face to face.',formType:'visit'}
},
grievance:{title:'Grievance Redressal',
 metaDesc:'Raise a grievance with Homworks — every concern gets a ticket number and a named grievance officer.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Contact',h:'contact.html'},{l:'Grievance Redressal'}],
 type:'grievance',
 hero:{style:'photo',art:'care',duo:'duo-terra',kicker:'Contact / Grievance Redressal',h1:'A concern raised<br>is a concern owned.',copy:'A clear home for customer complaints: raise one online, get a ticket number, and escalate to a named grievance officer if it is not resolved.',
 stats:[{n:'24hr',l:'acknowledgement'},{n:'1',l:'named officer'},{n:'100%',l:'tracked to close'}],
 ctas:[{label:'Raise a grievance',form:'grievance',primary:true},{label:'Call 1800 121 3110',href:'tel:18001213110'}]},
 faq:{eyebrow:'Questions',h2:'Grievance FAQs',items:[FAQ_GLOBAL[7],FAQ_GLOBAL[3]]},
 cta:{h2:'We want to make this right.',body:'Raise your concern and a named grievance officer will take ownership.',formType:'grievance'}
},

/* ===== Supporting pages ===== */
'customer-portal':{title:'Customer Portal',
 metaDesc:'Homworks customer portal for project tracking, approvals and service requests.',
 crumbs:[{l:'Home',h:'index.html'},{l:'My Homworks'}],
 type:'portal',
 hero:{style:'photo',art:'process',duo:'duo-ink',kicker:'My Homworks',h1:'Your project,<br>in one place.',copy:'Follow project milestones, share approvals, request service or raise a grievance — all from your customer portal.',
 ctas:[{label:'Raise a service ticket',form:'grievance',primary:true},{label:'Get customer support',href:'contact.html'}]},
 cardsSection:{eyebrow:'What you can do',h2:'Four things, one login.',cols:4,items:[
  {art:'process',tag:'Track',title:'Track my project',body:'Live milestones from design sign-off to move-in.',href:'delivery-planner.html'},
  {art:'design',tag:'Approve',title:'My approvals',body:'Review and sign off designs and quotes digitally.',form:'consultation'},
  {art:'care',tag:'Support',title:'Raise a service ticket',body:'Get a ticket number and track it to resolution.',form:'grievance'},
  {art:'villa',tag:'Care',title:'AMC & after-care',body:'Manage your annual maintenance plan.',href:'warranty-after-sales.html'}
 ]},
 faq:{eyebrow:'Questions',h2:'Portal FAQs',items:[FAQ_GLOBAL[7],FAQ_GLOBAL[8]]},
 cta:{h2:'Need help with your home?',body:'Raise a request and a Homworks team member will follow up.',formType:'grievance',label:'Raise a request'}
},
search:{title:'Search Homworks',type:'search',
 metaDesc:'Search Homworks for rooms, cities, guides and more.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Search'}],
 hero:{style:'art',art:'design',duo:'duo-deep',kicker:'Search',h1:'What are you<br>looking for?',copy:'Search rooms, cities, guides and frequently asked questions.'}
},
notfound:{title:'Page Not Found',type:'notfound',metaDesc:'This Homworks page could not be found.'},
'thank-you':{title:'Thank You',type:'thankyou',metaDesc:'Thank you for contacting Homworks.'},
'privacy-policy':{title:'Privacy Policy',
 metaDesc:'Homworks privacy policy — how we collect, use and protect your information.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Legal'},{l:'Privacy Policy'}],
 hero:{style:'plain',kicker:'Legal',h1:'Privacy Policy',copy:'Last updated January 2026. This policy explains how Stylcove Modulars Pvt Ltd (Homworks) collects, uses and protects your information.'},
 legal:[
  {h:'Information we collect',b:"We collect information you provide directly — such as your name, phone number, email and city — when you book a consultation, request a quote, download a brochure or contact us. We also collect basic usage data (pages visited, device type) to improve our website."},
  {h:'How we use it',b:"We use your information to respond to enquiries, schedule consultations and visits, prepare quotes, deliver projects, and share relevant updates. We do not sell your personal information to third parties."},
  {h:'Cookies',b:"Our website uses cookies to remember your preferences and understand how visitors use our site. You can disable cookies in your browser, though some features may not work as intended."},
  {h:'Third-party sharing',b:"We share information only with trusted partners directly involved in delivering your project (such as financing partners, where you opt in) or where required by law."},
  {h:'Your rights',b:"You can request access to, correction of, or deletion of your personal information at any time by contacting enquiry@homworks.com."},
  {h:'Contact us',b:"For any privacy-related questions, write to enquiry@homworks.com or call our toll-free number 1800 121 3110."}
 ]
},
'terms-and-conditions':{title:'Terms & Conditions',
 metaDesc:'Homworks terms and conditions governing use of our website and services.',
 crumbs:[{l:'Home',h:'index.html'},{l:'Legal'},{l:'Terms & Conditions'}],
 hero:{style:'plain',kicker:'Legal',h1:'Terms & Conditions',copy:'Last updated January 2026. These terms govern your use of the Homworks website and our interior design services.'},
 legal:[
  {h:'Acceptance of terms',b:"By using this website or engaging Homworks (Stylcove Modulars Pvt Ltd) for interior design services, you agree to these terms and conditions."},
  {h:'Services described',b:"Homworks provides end-to-end interior design, manufacturing and installation services. Specific scope, pricing and timelines for your project are confirmed in a separate signed agreement after design sign-off."},
  {h:'Quotes & payments',b:"Quotes are indicative until confirmed in writing after design sign-off. Payment schedules are outlined in your project agreement; standard milestones include design sign-off, production start and installation."},
  {h:'Cancellations',b:"Cancellation terms and any applicable refunds are set out in your individual project agreement, based on the stage of work completed."},
  {h:'Warranty reference',b:"All projects are covered by our standard 10-year warranty on cabinetry, carcass and mechanisms, detailed on our Warranty & After-Sales page."},
  {h:'Limitation of liability',b:"Homworks liability is limited to the value of the specific project agreement, except where limitation is not permitted by law."},
  {h:'Governing law',b:"These terms are governed by the laws of India, with courts in Coimbatore, Tamil Nadu having jurisdiction."},
  {h:'Contact',b:"Questions about these terms can be sent to enquiry@homworks.com."}
 ]
},
sitemap:{title:'Homworks Sitemap',type:'sitemap',
 metaDesc:'A complete sitemap of the Homworks website.',
 hero:{style:'plain',kicker:'Sitemap',h1:'Every page,<br>in one place.',copy:'A complete map of the Homworks website, grouped by section.'}
}
};

/* ===== Merge generated pages ===== */
KITCHEN_LAYOUTS.forEach((l,i)=>{PAGES['kitchen-'+l.slug]=kitchenLayoutPage(l,i)});
CITIES.forEach(c=>{PAGES['location-'+c.slug]=cityPage(c)});
BLOG_CATEGORIES.forEach(c=>{PAGES['blog-'+c.slug]=blogCatPage(c)});
BLOG_POSTS.forEach(p=>{PAGES['blog-post-'+p.slug]=blogPostPage(p)});
CASE_STUDIES.forEach(c=>{PAGES['case-study-'+c.slug]=caseStudyPage(c)});

/* ===== Site link registry (derived) ===== */
const SITE_LINKS=Object.keys(PAGES).filter(s=>!['search','notfound','thank-you'].includes(s)).map(slug=>{
 const d=PAGES[slug];
 const pillar=(d.crumbs&&d.crumbs.length>1&&d.crumbs[1].l)||'Homworks';
 return {href:slug+'.html',label:(d.title||slug).split(' — ')[0],desc:d.metaDesc||'',pillar,top:!!d.top};
}).concat([{href:'index.html',label:'Home',pillar:'Homworks',desc:'Homworks — interior design, done end to end.',top:true}]);

function legalHTML(sections){
 return `<section class="section container"><div style="max-width:760px" class="rv-stag">${sections.map(s=>`<div style="margin-bottom:34px"><h3 style="font-size:19px;letter-spacing:-.011em;margin:0 0 10px">${s.h}</h3><p style="color:var(--muted);line-height:1.7;font-size:15.5px;margin:0">${s.b}</p></div>`).join('')}</div></section>`;
}

/* ===== Interactive: wizard forms ===== */
let wizChoice='';
function openForm(type,prefill){
 const cfg=WIZARD_CONFIG[type]||WIZARD_CONFIG.consultation;
 wizChoice=prefill||'';
 const modal=$('#modal');
 modal.dataset.type=type;
 $('.modal-card',modal).innerHTML=wizardMarkup(cfg);
 $$('#wchips .chip').forEach(b=>{if(b.dataset.val===wizChoice)b.classList.add('active')});
 modal.classList.add('show');document.body.style.overflow='hidden';
}
function wizardMarkup(cfg){
 return `<button type="button" class="modal-close" onclick="closeForm()">×</button>
 <div class="wizard-head"><span class="eyebrow" style="color:#bfe3e1">Homworks</span><h3>${cfg.title}</h3><p>${cfg.subtitle}</p>
 <div class="wizard-progress"><i class="active"></i><i></i><i></i></div></div>
 <div class="wizard-body">
 <div class="wizard-step active" data-step="1"><p class="wstep-title">${cfg.chipLabel}</p><div class="chips" id="wchips">${cfg.chips.map(c=>`<button type="button" class="chip" data-val="${c}" onclick="wizChip(this)">${c}</button>`).join('')}</div>
  <div class="wizard-nav"><span></span><button type="button" class="btn primary" onclick="wizNext(2)">Continue <b>→</b></button></div></div>
 <div class="wizard-step" data-step="2"><p class="wstep-title">Where and when?</p><div class="wizard-grid">
  <select class="wide" id="wcity"><option value="">Select your city</option>${CITY_NAMES.map(c=>`<option>${c}</option>`).join('')}</select>
  <select class="wide" id="wwhen"><option value="">Preferred timing</option><option>As soon as possible</option><option>Within 1 month</option><option>1–3 months</option><option>Just exploring</option></select>
  ${cfg.ticket?`<input class="wide" id="wref" placeholder="Order / project ID (if you have one)">`:''}
  </div><div class="wizard-nav"><button type="button" class="wnav-back" onclick="wizNext(1)">← Back</button><button type="button" class="btn primary" onclick="wizNext(3)">Continue <b>→</b></button></div></div>
 <div class="wizard-step" data-step="3"><p class="wstep-title">Your details</p><div class="wizard-grid">
  <input class="wide" id="wname" placeholder="Your name">
  <input id="wphone" placeholder="Phone number">
  <input id="wemail" type="email" placeholder="Email address">
  </div><p style="font-size:10.5px;color:var(--muted);margin:12px 4px 0">By submitting, you agree to receive a call or WhatsApp from Homworks about your project.</p>
  <div class="wizard-nav"><button type="button" class="wnav-back" onclick="wizNext(2)">← Back</button><button type="button" class="btn primary" onclick="wizSubmit()">Submit <b>✓</b></button></div></div>
 </div>`;
}
function wizChip(el){$$('#wchips .chip').forEach(x=>x.classList.remove('active'));el.classList.add('active');wizChoice=el.dataset.val}
function wizNext(n){$$('.wizard-step').forEach(s=>s.classList.toggle('active',+s.dataset.step===n));$$('.wizard-progress i').forEach((d,i)=>d.classList.toggle('active',i<n))}
function wizSubmit(){
 const name=$('#wname'),phone=$('#wphone');
 if(!name.value.trim()||!phone.value.trim()){name.style.borderColor='var(--terra)';phone.style.borderColor='var(--terra)';return}
 const type=$('#modal').dataset.type;
 const cfg=WIZARD_CONFIG[type]||WIZARD_CONFIG.consultation;
 const ref='HMW-'+Math.random().toString(36).slice(2,7).toUpperCase();
 $('.wizard-body').innerHTML=`<div class="wsuccess"><div class="tick">✓</div><h3>${cfg.successTitle}</h3><p style="color:var(--muted);font-size:13.5px">${cfg.successBody}</p><span class="ref">REF ${ref}</span><div class="hero2-ctas" style="justify-content:center;margin-top:6px"><a class="btn primary" href="thank-you.html?type=${type}&ref=${ref}">View next steps <b>↗</b></a><button type="button" class="btn" onclick="closeForm()">Close</button></div></div>`;
 $('.wizard-progress').innerHTML='';
}
function closeForm(){$('#modal').classList.remove('show');document.body.style.overflow=''}
function submitFinder(){const room=$('#pf-room')?.value||'';openForm('quote',room)}
document.addEventListener('click',e=>{if(e.target.id==='modal')closeForm()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeForm()});

/* ===== Interactive: carousels, city switch, filters, planner, search ===== */
const slideState={};
function slideGo(id,dir,jump){
 const wrap=document.getElementById(id);if(!wrap)return;
 const track=$('.carousel-track',wrap);const n=track.children.length;
 let idx=slideState[id]||0;
 idx=jump!==undefined?jump:(idx+dir+n)%n;
 slideState[id]=idx;
 track.style.transform=`translateX(-${idx*100}%)`;
 $$('.carousel-dots button',wrap).forEach((d,i)=>d.classList.toggle('active',i===idx));
}
function switchCity(el,slug){
 $$('.city-btn',el.parentElement).forEach(b=>b.classList.remove('active'));el.classList.add('active');
 $$('.city-panel-inner',el.closest('.city-switch')).forEach(p=>p.classList.toggle('active',p.dataset.panel===slug));
}
function filterGallery(el,targetId,tag){
 $$('button',el.parentElement).forEach(b=>b.classList.remove('active'));el.classList.add('active');
 $$('.tcard',document.getElementById(targetId)).forEach(card=>{card.classList.toggle('hide',tag!=='all'&&!(card.dataset.tags||'').split(' ').includes(tag))});
}
function buildTimeline(){
 const rooms=$$('#plRooms .chip.active').map(c=>c.dataset.room);
 const city=$('#plCity').value;
 const note=$('#plNote');
 if(!rooms.length){note.textContent='Pick at least one room to continue.';note.style.color='var(--terra)';return}
 const base={'Full home':30,'Modular kitchen':18,'Living room':14,'Bedroom':12,'Wardrobes':10,'Pooja & foyer':8};
 const days=Math.max(...rooms.map(r=>base[r]||14))+(rooms.length>1?4:0);
 $('#plFill').style.height='0%';
 $$('.timeline-step',$('#plTimeline')).forEach(s=>s.classList.remove('done'));
 setTimeout(()=>{$('#plFill').style.height='100%';$$('.timeline-step',$('#plTimeline')).forEach((s,i)=>setTimeout(()=>s.classList.add('done'),i*220))},50);
 note.style.color='var(--deep)';
 note.innerHTML=`Estimated <b>${days} days</b> to move-in${city?' in '+city:''} for ${rooms.join(', ').toLowerCase()}. <button type="button" class="link-arrow" style="margin-left:6px" onclick="openForm('consultation','${rooms[0]}')">Book this plan</button>`;
}
function doSearch(q){
 q=q.trim().toLowerCase();
 const results=!q?SITE_LINKS.filter(l=>l.top):SITE_LINKS.filter(l=>l.label.toLowerCase().includes(q)||l.desc.toLowerCase().includes(q)||l.pillar.toLowerCase().includes(q));
 const grid=$('#searchResults');if(!grid)return;
 grid.className='tgrid cols-3 rv-stag on';
 grid.innerHTML=results.length?results.slice(0,18).map(r=>`<a class="tcard flat" href="${r.href}"><div class="tcard-body"><span class="eyebrow" style="color:var(--ink)">${r.pillar}</span><h3>${r.label}</h3><p>${r.desc}</p></div></a>`).join(''):`<div class="search-empty" style="grid-column:1/-1">No pages matched "${q}". Try "kitchen", "Chennai" or "warranty".</div>`;
}

/* ===== Init: motion & behaviour ===== */
function initTilt(){
 if(!matchMedia('(pointer:fine)').matches)return;
 $$('.tcard').forEach(card=>{
  card.addEventListener('mousemove',e=>{
   const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;const y=(e.clientY-r.top)/r.height;
   card.style.transform=`perspective(800px) rotateX(${(0.5-y)*8}deg) rotateY(${(x-0.5)*10}deg) translateY(-4px)`;
   const media=$('.tcard-media',card);if(media){media.style.setProperty('--gx',x*100+'%');media.style.setProperty('--gy',y*100+'%')}
  });
  card.addEventListener('mouseleave',()=>{card.style.transform=''});
 });
}
function initMagnetic(){
 if(!matchMedia('(pointer:fine)').matches)return;
 $$('.btn').forEach(b=>{
  b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px, ${(e.clientY-r.top-r.height/2)*.35-3}px)`});
  b.addEventListener('mouseleave',()=>b.style.transform='');
 });
}
function initCounters(){
 $$('.cnt').forEach(el=>{
  const target=parseFloat((el.dataset.num||'0').replace(/,/g,''));
  const suffix=el.dataset.suffix||'';
  const io=new IntersectionObserver(es=>es.forEach(e=>{
   if(!e.isIntersecting)return;
   const start=performance.now(),dur=1200;
   function tick(now){
    const p=Math.min(1,(now-start)/dur);const eased=1-Math.pow(1-p,3);
    el.textContent=Math.round(target*eased).toLocaleString('en-IN')+suffix;
    if(p<1)requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);io.unobserve(el);
  }),{threshold:.4});
  io.observe(el);
 });
}
function initReveal(){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.12});
 $$('.rv,.rv-stag').forEach(el=>io.observe(el));
}
function initAutoplay(){
 $$('.carousel-wrap').forEach(w=>{setInterval(()=>{if(!w.matches(':hover'))slideGo(w.id,1)},6000)});
}
function initAutoTimelines(){
 $$('.timeline').forEach(t=>{
  if(t.id==='plTimeline')return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{
   if(!e.isIntersecting)return;
   const fill=$('.timeline-fill',t);if(fill)fill.style.height='100%';
   $$('.timeline-step',t).forEach((s,i)=>setTimeout(()=>s.classList.add('done'),i*220));
   io.unobserve(t);
  }),{threshold:.3});
  io.observe(t);
 });
}
function initHeaderScroll(){
 const h=$('#siteHeader');if(!h)return;
 window.addEventListener('scroll',()=>h.classList.toggle('scrolled',window.scrollY>10),{passive:true});
}
function initMegaMenus(){
 // Pure CSS :hover breaks here because .mega is position:fixed and can sit a real gap away
 // from its trigger tab, so the cursor crosses "nothing" on the way down and the hover chain
 // drops before it ever reaches the panel. A JS open/close with a short grace-period timeout
 // survives that gap and survives moving from the tab straight into the panel.
 $$('.nav-item').forEach(item=>{
  const mega=$('.mega',item);
  if(!mega)return;
  let closeTimer=null;
  const open=()=>{clearTimeout(closeTimer);$$('.mega.show').forEach(m=>{if(m!==mega)m.classList.remove('show')});mega.classList.add('show')};
  const scheduleClose=()=>{clearTimeout(closeTimer);closeTimer=setTimeout(()=>mega.classList.remove('show'),250)};
  item.addEventListener('mouseenter',open);
  item.addEventListener('mouseleave',scheduleClose);
  mega.addEventListener('mouseenter',()=>clearTimeout(closeTimer));
  mega.addEventListener('mouseleave',scheduleClose);
  item.addEventListener('focusin',open);
  item.addEventListener('focusout',e=>{if(!item.contains(e.relatedTarget))scheduleClose()});
 });
}

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded',()=>{
 const slug=document.body.dataset.page||'interiors';
 const d=PAGES[slug]||PAGES.interiors;
 document.title=(d.title||'Homworks')+' | Homworks';
 let m=document.querySelector('meta[name="description"]');
 if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m)}
 if(d.metaDesc)m.content=d.metaDesc;
 const app=document.getElementById('app');
 app.innerHTML=chromeHeader()+'<main>'+renderBody(slug)+'</main>'+chromeFooter();
 initTilt();initMagnetic();initCounters();initReveal();initAutoplay();initAutoTimelines();initHeaderScroll();initMegaMenus();
 if(d.type==='search')doSearch('');
 window.addEventListener('load',()=>setTimeout(()=>{const p=document.getElementById('preloader');if(p)p.classList.add('out')},350));
 setTimeout(()=>{const p=document.getElementById('preloader');if(p)p.classList.add('out')},1400);
});
