/* Homworks homepage interactions (Landing 5) */
(function(){
  'use strict';
  window.__hw5=true;
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Sub-pages are not part of the review build: links stay inert (href="#") until SUBPAGES is switched on. */
  var SUBPAGES=false;
  function lk(u){return SUBPAGES?u:'#'}
  $$('a[data-href]').forEach(function(a){if(SUBPAGES)a.setAttribute('href',a.getAttribute('data-href'))});
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a&&a.getAttribute('href')==='#')e.preventDefault()});

  /* nav */
  var nav=$('#nav'),burger=$('#burger'),mnav=$('#mnav');
  var lastY=window.scrollY,userAt=0;
  ['wheel','touchstart','touchmove','keydown','mousedown','click'].forEach(function(ev){window.addEventListener(ev,function(){userAt=performance.now()},{passive:true,capture:true})});
  function onScroll(){
    var y=Math.max(0,window.scrollY),dy=y-lastY,mine=performance.now()-userAt<900;
    nav.classList.toggle('scrolled',y>10);
    if(y<=10||mnav.classList.contains('show'))nav.classList.remove('hide');
    else if(mine){
      if(dy>4&&y>nav.offsetHeight)nav.classList.add('hide');
      else if(dy<-4)nav.classList.remove('hide');
    }
    lastY=y;
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  burger.addEventListener('click',function(){var o=mnav.classList.toggle('show');burger.setAttribute('aria-expanded',o);nav.classList.toggle('menu-open',o);nav.classList.remove('hide')});
  $$('a',mnav).forEach(function(a){a.addEventListener('click',function(){mnav.classList.remove('show');nav.classList.remove('menu-open');burger.setAttribute('aria-expanded','false')})});


  /* hero: cursor-follow before / after reveal (organic blob mask) */
  (function(){
    var hero=$('#hero'),svg=$('#heroSvg');if(!hero||!svg)return;
    var inv=$('#heroInv'),hc=$('.hero-copy'),img=$('#hImg'),mask=$('#hMask'),filt=$('#hGoo'),disp=$('feDisplacementMap',svg);
    var c=[$('#hc0'),$('#hc1'),$('#hc2')],W=0,H=0,R=0,home={x:0,y:0};
    var pts=[{x:0,y:0,k:.16},{x:0,y:0,k:.085},{x:0,y:0,k:.05}],tgt={x:0,y:0};
    var pointer=false,lastMove=0,grow=0,raf=0,visible=true,t0=performance.now(),small=false,handle=$('#heroDrag'),line=$('#heroLine'),dragging=false,smallInit=false;
    function size(){
      var r=hero.getBoundingClientRect();W=r.width;H=r.height;
      svg.setAttribute('width',W);svg.setAttribute('height',H);
      [img,mask].forEach(function(n){n.setAttribute('width',W);n.setAttribute('height',H)});
      small=W<860;
      img.setAttribute('preserveAspectRatio','xMidYMid slice');
      R=small?W*.42:Math.max(150,Math.min(W*.205,H*.46));
      home=small?{x:W*.5,y:H*.5}:{x:W*.74,y:H*.5};
      disp.setAttribute('scale',Math.round(R*.42));
      if(!pts[0].x){pts.forEach(function(q){q.x=home.x;q.y=home.y});tgt.x=home.x;tgt.y=home.y}
      if(small){
        if(!smallInit){tgt.x=home.x;tgt.y=home.y;smallInit=true}
        tgt.x=Math.min(W,tgt.x);tgt.y=Math.min(H,tgt.y);
        img.removeAttribute('mask');inv.style.webkitMaskImage=inv.style.maskImage='none';
      }else{
        img.setAttribute('mask','url(#hMask)');svg.style.clipPath='';inv.style.clipPath='';inv.style.webkitMaskImage=inv.style.maskImage='';
      }
      draw();
    }
    function draw(){
      if(handle)handle.style.transform='translate('+tgt.x+'px,'+tgt.y+'px)';
      if(small){
        /* diagonal split through the handle: before on the left, after on the right */
        var sl=.3,x0=tgt.x+sl*tgt.y,x1=tgt.x-sl*(H-tgt.y),E=W+80,ox=hc.offsetLeft,oy=hc.offsetTop;
        svg.style.clipPath='polygon('+x0+'px 0,'+E+'px 0,'+E+'px '+H+'px,'+x1+'px '+H+'px)';
        inv.style.clipPath='polygon('+(x0-ox)+'px '+(-oy)+'px,'+(E-ox)+'px '+(-oy)+'px,'+(E-ox)+'px '+(H-oy)+'px,'+(x1-ox)+'px '+(H-oy)+'px)';
        if(line)line.style.clipPath='polygon('+(x0-1.5)+'px 0,'+(x0+1.5)+'px 0,'+(x1+1.5)+'px '+H+'px,'+(x1-1.5)+'px '+H+'px)';
        return;
      }
      var rr=[R*grow,R*.7*grow,R*.46*grow];
      for(var i=0;i<3;i++){c[i].setAttribute('cx',pts[i].x);c[i].setAttribute('cy',pts[i].y);c[i].setAttribute('r',Math.max(0,rr[i]))}
      var m=R*2.3;
      if(inv){inv.style.setProperty('--mx',(pts[0].x-hc.offsetLeft)+'px');inv.style.setProperty('--my',(pts[0].y-hc.offsetTop)+'px');inv.style.setProperty('--mr',(R*grow*.82)+'px')}
      filt.setAttribute('x',pts[0].x-m);filt.setAttribute('y',pts[0].y-m);filt.setAttribute('width',m*2);filt.setAttribute('height',m*2);
    }
    function tick(now){
      raf=0;
      var t=now-t0;
      grow+=((pointer?1:0)-grow)*(pointer?.09:.06);
      pts.forEach(function(q,i){var to=i?pts[i-1]:tgt;q.x+=(to.x-q.x)*q.k;q.y+=(to.y-q.y)*q.k});
      draw();
      var moving=Math.abs(pts[2].x-tgt.x)+Math.abs(pts[2].y-tgt.y)>.4;
      if(visible&&((pointer&&(grow<.996||moving))||(!pointer&&grow>.004)))raf=requestAnimationFrame(tick);else{if(!pointer)grow=0;draw()}
    }
    function start(){if(!raf&&!reduce)raf=requestAnimationFrame(tick)}
    function place(e){if(small&&!dragging)return;var r=hero.getBoundingClientRect();tgt.x=e.clientX-r.left;tgt.y=e.clientY-r.top;if(small){tgt.x=Math.max(0,Math.min(W,tgt.x));tgt.y=Math.max(0,Math.min(H,tgt.y));draw();return}if(!pointer){pts.forEach(function(q){q.x=tgt.x;q.y=tgt.y})}pointer=true;lastMove=performance.now();start()}
    hero.addEventListener('pointermove',place);
    hero.addEventListener('pointerdown',place);
    hero.addEventListener('pointerleave',function(){if(small)return;pointer=false;start()});
    hero.addEventListener('pointerup',function(e){if(e.pointerType!=='mouse'&&!small){pointer=false;start()}});
    if(handle){handle.addEventListener('pointerdown',function(e){dragging=true;try{handle.setPointerCapture(e.pointerId)}catch(_){}});['pointerup','pointercancel'].forEach(function(n){handle.addEventListener(n,function(){dragging=false})})}
    window.addEventListener('resize',size);
    size();
    if(reduce){return}
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)start()},{threshold:0}).observe(hero);
    }
    start();
  })();

  /* reveal on scroll */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    $$('.rv').forEach(function(el){io.observe(el)});
  }else $$('.rv').forEach(function(el){el.classList.add('in')});

  /* how it works: scroll-driven steps (desktop) / click accordion (mobile) */
  var stages=$$('.stage'),pvImgs=$$('.pv-img img'),sCards=$$('.style-card'),pill=$('#pvPill'),pillSpan=$('span',pill);
  var PILL=['Explore Designs','Approve your design','Fitted by our team'],cur3=-1;
  function openStage(i){
    if(i===cur3)return;cur3=i;
    stages.forEach(function(s,k){var on=k===i;s.classList.toggle('open',on);$('.stage-btn',s).setAttribute('aria-expanded',on)});
    pvImgs.forEach(function(im,k){im.classList.toggle('on',k===i)});
    sCards.forEach(function(c,k){c.classList.toggle('off',k!==i)});
    pillSpan.textContent=PILL[i];
  }
  var track=$('#stepsTrack'),stepsEl=$('#steps'),headEl=$('.hiw-head'),deskQ=window.matchMedia('(min-width:981px)');
  function layoutSteps(){
    var hh=headEl.offsetHeight;document.documentElement.style.setProperty('--hh',hh+'px');
    var ph=Math.max(560,window.innerHeight-hh);
    document.documentElement.style.setProperty('--ph',ph+'px');
  }
  function stepScroll(){
    if(!deskQ.matches)return;
    var r=track.getBoundingClientRect(),stuck=stepsEl.offsetHeight,range=track.offsetHeight-stuck;
    var navH=headEl.offsetHeight;
    var p=(navH-r.top)/range; /* r.top reaches navH when pinned */
    p=Math.min(.9999,Math.max(0,p));
    openStage(Math.floor(p*3));
  }
  stages.forEach(function(s,i){
    $('.stage-btn',s).addEventListener('click',function(){
      if(deskQ.matches){
        var range=track.offsetHeight-stepsEl.offsetHeight,navH=headEl.offsetHeight;
        var start=track.getBoundingClientRect().top+scrollY-navH;
        window.scrollTo({top:start+range*((i+.5)/3),behavior:'smooth'});
      }else openStage(i);
    });
  });
  layoutSteps();window.addEventListener('resize',function(){layoutSteps();stepScroll()});
  window.addEventListener('load',function(){layoutSteps();stepScroll()});
  window.addEventListener('scroll',stepScroll,{passive:true});
  deskQ.addEventListener&&deskQ.addEventListener('change',function(){cur3=-1;openStage(0);stepScroll()});
  stepScroll();
  sCards.forEach(function(card){
    var tiles=$$('.tile',card),pfill=$('.pbar i',card);
    pfill.style.width=tiles[0].dataset.p+'%';
    tiles.forEach(function(t){
      t.addEventListener('mouseenter',function(){tiles.forEach(function(x){x.classList.remove('on')});t.classList.add('on');pfill.style.width=t.dataset.p+'%'});
    });
  });

  /* what we design: expanding cards (autoplay) that also drive the lower showcase */
  var P=[
    {h:'Custom designs for each room',p:'A cohesive plan for every space, with one team accountable from the first design to final handover.',pills:['Kitchen','Bedrooms','Living room','Pooja room','Home office','Dining'],link:['Explore full home interiors','full-home-interiors.html'],cards:[
      ['full-home-interiors.html','home/home-office.jpg','Home office','A bright, light place to think and create – a minimal, stylish and elegant office with sleek interiors of your choice.'],
      ['foyer-pooja-units.html','home/pooja-room.jpg','Pooja room','Designed with vastu for prayer and meditation – a peaceful interior that brings a positive vibration to your home.'],
      ['full-home-interiors.html','home/dining.jpg','Dining','“The family that eats together stays together.” Spacious or compact, with every inch detailed and well designed.'],
      ['full-home-interiors.html','home/vanity.jpg','Vanity','A perfectly blended vanity brings out the beauty of the room – a timeless contemporary style for your home.']]},
    {h:'Enhancing your entertainment space.',p:'Console units, partitions, wall panels and TV units - let custom cabinets become style statements.',pills:['Console units','Living partitions','Wall panels','TV units'],link:['Explore living rooms','living-rooms.html'],cards:[
      ['living-rooms.html','home/living-console.jpg','Console unit','A definite eye-catcher, in many styles.'],
      ['living-rooms.html','home/living-partition.jpg','Living partition','Decor at its finest – it can make or break your living room’s style.'],
      ['living-rooms.html','home/living-wall-panel.jpg','Wall panel','Exquisite panelling that ties the whole room together.'],
      ['tv-units.html','home/tv-floor-standing.jpg','TV unit · floor-standing','Low cabinets on a baseboard, for a contemporary look.'],
      ['tv-units.html','home/tv-wall-hung.jpg','TV unit · wall-hung','Floating cabinets that leave the floor clear; a plinth can be added.']]},
    {h:'The kitchen of your dreams',p:'Beyond just a place to cook, a space where families gather. Pick from 6 layouts in 6 styles, shaped around people who use it.',pills:['Indian Classic','Contemporary','Indian Traditional','Minimalistic','Modern','English Classic'],link:['Explore modular kitchens','modular-kitchens.html'],cards:[
      ['kitchen-l-shaped.html','home/kitchen-l-shaped.jpg','L-shaped','A popular corner layout with an efficient work triangle and room for an island.',['#b4a9a0','#756d69','#534b46','#ce9f6c']],
      ['kitchen-u-shaped.html','home/kitchen-u-shaped.jpg','U-shaped','Three-sided cabinetry saves space and adds storage for shared cooking.',['#b59f8c','#6f6e6c','#73675f','#50422b']],
      ['kitchen-galley.html','home/kitchen-galley.jpg','Galley','Facing walls maximize storage and create an efficient work triangle in narrow spaces.',['#d4c9c3','#8b746c','#7f6c63','#9a5b3f']],
      ['kitchen-one-wall.html','home/kitchen-straight.jpg','One-wall','Every workstation along a single wall – simple, unobstructed and ideal for a smaller villa or condo.',['#dbd1ca','#6b6661','#222120','#473e38']],
      ['kitchen-peninsular.html','home/kitchen-peninsular.jpg','Peninsular','A U-shape with a connected extension – extra counter, a breakfast corner and a defined open-plan space.',['#b3aca4','#353236','#3f4860','#8a837d']],
      ['kitchen-island.html','home/kitchen-island.jpg','Island','Any layout, plus a freestanding island for prep, socialising and appliances.',['#cfc2b8','#7a5e49','#342718','#b8824e']]]},
    {h:'Cots crafted for comfort',p:'Made from quality materials, our cots are the foundation for your dreams – styled to suit your interior.',pills:['Cots','Headboards','Wardrobes',"Kids' rooms"],link:['Explore bedrooms','bedrooms.html'],cards:[
      ['bedrooms.html','home/cot-hydraulic.jpg','Hydraulic cot','A modern, clinical finish for someone who likes a little gadgetry.'],
      ['bedrooms.html','home/cot-storage.jpg','Cot with storage','A handy storage space built in underneath.'],
      ['bedrooms.html','home/cot-fabric.jpg','Fabric headboard','Popular for the soft comfort that wood can’t give.'],
      ['wardrobes.html','home/wardrobe-l-shaped.jpg','L-shaped wardrobe','For those who want to use every bedroom corner – often fitted with a sliding-door system, in a corner with good light.',['#dfdbd6','#9b8474','#826050','#91522f']],
      ['wardrobes.html','home/wardrobe-walk-in.jpg','Walk-in wardrobe','The dream wardrobe and an epitome of luxury – best built inside an unused room, and lit like a showroom.',['#b8ad9a','#918a84','#804f31','#583522']],
      ['bedrooms.html','home/kids-bunk.jpg','Bunk bed with steps','A bunk bed with a built-in staircase.']]}
  ];
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
  var kitIn=$('.kit-in'),kt=$('#ktrack'),kp=$('#kprev'),kn=$('#knext'),kcards=[],ki=0;
  function perView(){var w=kcards[0].getBoundingClientRect().width,rw=kt.parentNode.getBoundingClientRect().width;return Math.max(1,Math.round(rw/(w+21)))}
  function kUpdate(){
    if(!kcards.length)return;
    var pv=perView(),max=Math.max(0,kcards.length-pv);ki=Math.min(Math.max(ki,0),max);
    var step=kcards[0].getBoundingClientRect().width+21;
    kt.style.transform='translateX('+(-ki*step)+'px)';
    kp.disabled=ki<=0;kn.disabled=ki>=max;
  }
  function renderKit(d){
    $('#kitH').textContent=d.h;$('#kitP').textContent=d.p;
    $('#kitPills').innerHTML=d.pills.map(function(t){return '<a href="'+lk('design-styles.html')+'">'+esc(t)+'</a>'}).join('');
    var l=$('#kitLink');l.href=lk(d.link[1]);l.innerHTML='<span>'+esc(d.link[0])+'</span><span>›</span>';
    kt.innerHTML=d.cards.map(function(c){
      return '<a class="kcard" href="'+lk(c[0])+'"><figure><img src="assets/'+c[1]+'" alt="'+esc(c[2])+'" loading="lazy"></figure><div><h3>'+esc(c[2])+'</h3><p>'+esc(c[3])+'</p>'+
        (c[4]?'<span class="pal">'+c[4].map(function(x){return '<i style="--c:'+x+'"></i>'}).join('')+'</span>':'')+'</div></a>'}).join('');
    kcards=$$('.kcard',kt);ki=0;kUpdate();
  }
  var cards=$('#cards'),cats=$$('.cat',cards),cur=cats.findIndex(function(c){return c.classList.contains('on')}),timer,shown=cur,DUR=6000;
  /* mobile: the examples panel sits inside the open card, like an accordion */
  var kitSec=$('#kitchens'),kitHome=document.createComment('kit-home'),mobQ=window.matchMedia('(max-width:860px)');
  kitSec.parentNode.insertBefore(kitHome,kitSec);
  function placeKit(){
    if(mobQ.matches){var on=cats[cur];if(on.nextSibling!==kitSec)on.parentNode.insertBefore(kitSec,on.nextSibling);kitSec.classList.add('in-cards')}
    else if(kitSec.classList.contains('in-cards')){kitHome.parentNode.insertBefore(kitSec,kitHome.nextSibling);kitSec.classList.remove('in-cards')}
    kUpdate();
  }
  function showPanel(i){
    if(i===shown)return;shown=i;kitIn.classList.add('swap');
    setTimeout(function(){renderKit(P[i]);kitIn.classList.remove('swap')},280);
  }
  function setCat(i){
    cur=(i+cats.length)%cats.length;
    placeKit();
    cats.forEach(function(c,k){c.classList.toggle('on',k===cur);var pr=$('.prog i',c);if(pr){pr.style.animation='none';void pr.offsetWidth;pr.style.animation=''}});
    showPanel(cur);
  }
  function play(){clearInterval(timer);if(reduce)return;timer=setInterval(function(){setCat(cur+1)},DUR)}
  cards.style.setProperty('--dur',DUR+'ms');
  cats.forEach(function(c,i){c.addEventListener('click',function(e){if(i!==cur){e.preventDefault();setCat(i);play()}})});
  var hold=false;
  function pause(){hold=true;cards.classList.add('paused');clearInterval(timer)}
  function resume(){hold=false;cards.classList.remove('paused');setCat(cur);play()}
  var hoverQ=window.matchMedia('(hover:hover)');
  cards.addEventListener('mouseenter',function(){if(hoverQ.matches&&!mobQ.matches)pause()});
  cards.addEventListener('mouseleave',function(){if(hold)resume()});
  if('IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!hold){setCat(cur);play()}}else clearInterval(timer)})},{threshold:.12});
    cio.observe(cards);
  }else play();
  kp.addEventListener('click',function(){ki--;kUpdate()});
  kn.addEventListener('click',function(){ki++;kUpdate()});
  window.addEventListener('resize',kUpdate);
  renderKit(P[cur]);placeKit();
  mobQ.addEventListener&&mobQ.addEventListener('change',placeKit);
  var tx=null;
  kt.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  kt.addEventListener('touchend',function(e){if(tx===null)return;var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40){ki+=d<0?1:-1;kUpdate()}tx=null});

  /* interior guide: 16 questions, hover / tap for the detail card */
  var IC={
    layers:'M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5',
    drop:'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
    wind:'M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8',
    award:'M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM9 12.5 8 21l4-2 4 2-1-8.5M12 6.5v3',
    frame:'M4 4h16v16H4ZM8 8h8v8H8Z',
    glue:'M10 3h4v3h-4ZM8 6h8l1 4v10H7V10l1-4ZM10 14h4',
    tool:'M14 6l4 4-8 8H6v-4l8-8ZM13 7l4 4',
    box:'M4 7l8-4 8 4v10l-8 4-8-4V7ZM4 7l8 4 8-4M12 11v10',
    scratch:'M4 4h16v16H4ZM8 16 16 8M8 12l4-4',
    grid:'M4 4h16v16H4ZM4 10h16M10 4v16',
    bars:'M5 20V10M12 20V4M19 20v-8',
    gap:'M3 12h18M3 8v8M21 8v8M8 12h.01M16 12h.01',
    palette:'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-5-4-11-8-11ZM8 11h.01M12 8h.01M16 11h.01',
    home:'M3 11 12 3l9 8M5 10v10h14V10M12 15a2 2 0 1 0 0 .01',
    tag:'M3 12V4h8l10 10-8 8L3 12ZM7.5 8.5h.01',
    check:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 12l3 3 5-6'
  };
  var A='assets/';
  var GD=[
    ['layers','The board behind the surface','The board inside your cabinet decides how long it lasts.','Every shelf, shutter and drawer carries weight, day after day.','Common industry practice uses a mix of board types (BWR, MR, MDF, particle board, paper-foil board) and the grade is often not stated.','ISI-certified BWP / HDHMR E0 double-side post-laminated boards are used as the core material in every carcass.','Which board do you use for the carcass, and is it certified?',A+'home5/w7-5.webp','Core board'],
    ['drop','Moisture, and the 72-hour boiling test','Kitchens and bathrooms are damp, hot and wet places.','Steam, spills and wall dampness reach your furniture every day.','Boards that are not water-tested can swell and weaken over time.','Every BWP-grade plywood is tested in boiling water for 72 hours, with results recorded before it is used in projects.','Can you show me the water-test results for this board?',A+'home5/w7-8.webp','Moisture resistance'],
    ['wind','Healthy indoor air','What your furniture is made of is part of the air at home.','Wardrobes, kitchens and beds are in your rooms around the clock.','Boards differ in what they release into the room, and many vendors do not say which grade they use.','Core boards are E0 grade, with no formaldehyde, in all carcasses.','What emission grade are your boards, and can you show it in writing?',A+'home/living-room.jpg','Everyday living'],
    ['award','Certified and tested','Certificates and test records are how you check a promise.','A claim about quality is only as good as the record behind it.','Many vendors give no clarity on which tests were done or what the results were.','ISI-certified boards, and an in-house material testing lab at our factory. Each material is tested twice: when it reaches the factory and when it is issued to a project. We can provide tested samples of the core materials.','Which tests do you run, and can I see a tested sample?',A+'home5/w7-1.webp','Material checks'],
    ['frame','Sealed edges','Edge bands protect the core board from water and wear.','Wiping, steam and splashes meet the edges of every panel.','Conventional EVA glue applied by hand on ordinary machines may not give the same water resistance and bond strength.','Edge-banding on advanced IMA machines with PUR hot-melt glue. “Peel-off” tests every 2 hours on the lines, with edge strength above 7 Newtons.','How are the edges banded, and how is the bond tested?',A+'home5/guide-tile.webp','Edge-banding detail'],
    ['glue','The glue you never see','Different parts of your furniture need different bonding systems.','Heat and steam from the kitchen, water splashing on it while cleaning, and years of everyday use affect the quality of furniture.','Poor bonding can lead to laminate lifting, bubbling, or edges coming loose.','Henkel D3 adhesive for laminate pressing, and PUR hot-melt glue for machine edge-banding and specified lamination – ideal for high-temperature environments like kitchens, withstanding up to 80° C.','“What adhesive do you use for pressing, and what for edge-banding?”',A+'home5/guide-06.webp','Edge-banding detail'],
    ['tool','Hardware and joints','Hinges, runners and dowels do the moving and the holding.','Doors and drawers open and close many times a day.','Materials and accessories are often not tested.','A drawer and shutter cycle test for the durability of runners and hinges, and a compression test for the strength of the board and the load-bearing capacity of the dowel.','How do you test hinges, runners and joints?',A+'home5/w7-6.webp','Joints and fittings'],
    ['box','Double-carcass boxes','How a cabinet box is built decides how it carries weight and how it can be repaired.','Kitchen tops and loft units hold a lot of weight.','Many major players use a single-carcass system to reduce costs, which can compromise quality and the weight-bearing capacity of the kitchen top.','A double-carcass system on every project, so a single unit can be replaced easily without disturbing the other cabinets.','Is the carcass single or double, and can one unit be replaced on its own?',A+'home5/why-photo.webp','Cabinet construction'],
    ['scratch','Scratches and finish','Surface finishes need to cope with daily wear.','Pots, bags, keys and cleaning all touch your surfaces.','Many vendors give no information on scratch-resistance testing.','A scratch-resistance test on acrylics, laminates and foils. Acrylic is passed through the flat lamination line with PUR hot-melt glue, with an ABS backer of the same thickness and density on the back of the board.','Do you test scratch resistance, and what backer is used on acrylic?',A+'home5/fan-lamination.webp','Surface finish'],
    ['grid','Factory-made precision','Where your furniture is made decides how precise it is.','Fitting is smoother when parts are cut and finished to the millimetre.','Many vendors depend on facilities owned by others, and do most of the work on site, which disturbs the home and can compromise quality.','Our own manufacturing facility with CNC and flat-lamination machinery imported from Italy and Germany. Site carpentry is kept for fillers, end panels and visible panels.','Who makes my furniture, and where?',A+'home5/w7-2.webp','In our factory'],
    ['bars','Strength and load','Furniture has to carry real loads for years.','Shelves, tops and legs are loaded every day.','Vendors often give no clarity on strength testing.','A vertical force test for the load-bearing capacity of a panel, and a leg-strength test to find the breaking point of the leg.','How do you test load capacity and leg strength?',A+'home/factory-cnc.jpg','Load testing'],
    ['gap','The 18mm gap from the wall','Walls hold dampness, and cabinets should not touch it.','Damp walls are common, especially on outer walls and in wet areas.','Most industry practice leaves no gap, so the carcass touches the wall and exposes plywood to moisture, reducing durability.','An 18mm gap between the wall and the carcass keeps the core materials away from wall dampness, so the product lasts longer.','Is there a gap between my cabinets and the wall?',A+'home/installation.jpg','Installation'],
    ['palette','Range of finishes','The finish is what you see and touch every day.','Texture and colour set the mood of every room.','A narrow range can limit your design.','Lamination, membrane, acrylic and PU paint, in a wide range of designs, colours and finishing options for every room in your home.','Which finishes can I choose from, and can I see samples?',A+'home5/w7-3.webp','Finish samples'],
    ['home','Customized for your family','Factory-made does not have to mean standard-sized.','Every home and every family stores and lives differently.','Standard sizes can leave gaps and awkward corners.','Furniture is designed around your room dimensions, storage needs and chosen finishes, with the design and measurements confirmed before production.','Will it be designed around my room and my storage needs?',A+'home/kitchen-l-shaped.jpg','Made for your space'],
    ['tag','Module-wise pricing','How you are quoted decides how clear the cost is.','Each space needs specific materials, hardware and accessories, and costs differ from module to module.','Most vendors quote a square-foot price, which offers no clarity on the cost of materials and accessories and can lead to higher prices during completion.','Module-wise pricing, so the quotation is as close as possible to the final cost.','Can you give me a module-wise quote?',A+'home5/w7-4.webp','Clear quotes'],
    ['check','The final quality check','A project should be checked before it reaches your home.','Small faults are easier to fix at the factory than in your living room.','Without a defined check, faults can reach site.','Every project goes through our quality checks before handover, backed by our in-house testing lab and 10-year warranty.','What is checked before my project is handed over?',A+'home/materials.jpg','Quality checks']
  ];
  var gGrid=$('#gGrid'),gPop=$('#gPop'),gWrap=$('#gWrap'),gBack=$('#gBack'),gCur=-1,gTimer=0,gCells=[];
  function mobileG(){return window.innerWidth<=980||(window.matchMedia&&matchMedia('(pointer:coarse)').matches&&window.innerWidth<=1100)}
  GD.forEach(function(g,i){
    var n=('0'+(i+1)).slice(-2),b=document.createElement('button');
    b.type='button';b.className='g2c';b.setAttribute('aria-haspopup','dialog');
    b.innerHTML='<div class="bg" style="background-image:url(\''+g[7]+'\')"></div><svg viewBox="0 0 24 24"><path d="'+IC[g[0]]+'"/></svg><span>'+n+'. '+esc(g[1])+'</span>';
    gGrid.appendChild(b);gCells.push(b);
    b.addEventListener('mouseenter',function(){if(!mobileG()){clearTimeout(gTimer);gTimer=setTimeout(function(){showG(i)},70)}});
    b.addEventListener('focus',function(){if(!mobileG())showG(i)});
    b.addEventListener('click',function(){if(mobileG()&&gCur===i){hideG()}else showG(i)});
  });
  function showG(i){
    var g=GD[i],n=('0'+(i+1)).slice(-2),cell=gCells[i];
    gCur=i;gCells.forEach(function(c,k){c.classList.toggle('on',k===i)});
    gPop.innerHTML='<button type="button" class="pop-x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'+
      '<div class="pop-t"><p class="pop-n">'+n+'</p><h3>'+esc(g[1])+'</h3><p>'+esc(g[2])+'</p>'+
      '<h4>In daily life:</h4><p>'+esc(g[3])+'</p><h4>The risk:</h4><p>'+esc(g[4])+'</p><h4>The Homworks standard:</h4><p>'+esc(g[5])+'</p><h4>What to ask:</h4><p>'+(g[6].charAt(0)==='“'?esc(g[6]):'“'+esc(g[6])+'”')+'</p></div>'+
      '<div class="pop-i"><img src="'+g[7]+'" alt=""><div class="cap">'+esc(g[8])+'</div></div>';
    gPop.classList.toggle('tip',!mobileG());
    gPop.hidden=false;gPop.setAttribute('role',mobileG()?'dialog':'tooltip');gPop.setAttribute('aria-label',g[1]);
    $('.pop-x',gPop).addEventListener('click',hideG);
    if(mobileG()){gPop.style.left=gPop.style.top='';gBack.hidden=false;return}
    gBack.hidden=true;
    var col=i%4,pw=gPop.offsetWidth,ph=gPop.offsetHeight,wh=gWrap.offsetHeight;
    var left=col<2?cell.offsetLeft+cell.offsetWidth+8:cell.offsetLeft-pw-8;
    left=Math.max(0,Math.min(left,gWrap.offsetWidth-pw));
    var top=Math.max(0,Math.min(cell.offsetTop+cell.offsetHeight/2-ph/2,wh-ph));
    gPop.style.left=left+'px';gPop.style.top=top+'px';
  }
  function hideG(){clearTimeout(gTimer);gPop.hidden=true;gBack.hidden=true;gCells.forEach(function(c){c.classList.remove('on')});gCur=-1}
  gWrap.addEventListener('mouseleave',function(){if(!mobileG()){clearTimeout(gTimer);gTimer=setTimeout(hideG,260)}});
  gWrap.addEventListener('mouseenter',function(){clearTimeout(gTimer)});
  gBack.addEventListener('click',hideG);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hideG()});
  document.addEventListener('click',function(e){if(gCur>-1&&!e.target.closest('#gWrap'))hideG()});

  /* finishes fan */
  var FIN=[
    ['Lamination',[['check','Most common finish; withstands rough surfaces.'],['layers','Understated appearance lets the material take centre stage.'],['leaf','Creates a natural, seamless look.'],['home','Cohesive finish that complements interiors—from clean, contemporary spaces to warm, traditional settings.']]],
    ['Membrane',[['check','A unique finish with a natural appeal.'],['home','At home in traditional and contemporary designs.'],['palette','Available in matte, gloss, wooden and many colours.']]],
    ['Acrylic',[['layers','A glassy, almost mirror-like surface with a plush sheen.'],['leaf','Non-toxic.'],['palette','Available in a wide range of colours.']]],
    ['PU paint',[['layers','A finish that elevates the space.'],['check','Protects the cabinets.'],['home','Lasts longer — sturdier and stronger.']]]
  ];
  var FI={check:'M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3ZM9 12l2 2 4-4',layers:IC.layers,leaf:'M5 19c0-8 5-14 15-14 0 9-5 15-13 14M5 19c3-5 6-8 10-10',home:'M4 11 12 4l8 7M6 10v9h12v-9M10 19v-5h4v5',palette:IC.palette};
  var fInfo=$('#fanInfo'),dots=$$('#finDots button'),front=0;
  function setFan(dir){
    var f=FIN[front],layers=$$('.fl');
    if(dir){var inc=layers[front];inc.style.transition='none';inc.classList.remove('act','prev','next');inc.classList.add(dir>0?'next':'prev');void inc.offsetWidth;inc.style.transition=''}
    fInfo.classList.remove('swap');void fInfo.offsetWidth;fInfo.classList.add('swap');
    fInfo.innerHTML='<h3>'+f[0]+'</h3><ul>'+f[1].map(function(b){return '<li><i><svg viewBox="0 0 24 24"><path d="'+FI[b[0]]+'"/></svg></i><span>'+esc(b[1])+'</span></li>'}).join('')+'</ul>';
    layers.forEach(function(l,k){if(k===front){l.classList.remove('prev','next');l.classList.add('act')}else if(l.classList.contains('act')){l.classList.remove('act');l.classList.add(dir<0?'next':'prev')}});
    dots.forEach(function(d,i){d.classList.toggle('on',i===front);d.setAttribute('aria-selected',i===front)});
  }
  var ltSw=$('#ltSw');
  ltSw.addEventListener('click',function(e){
    e.stopPropagation();
    var on=ltSw.getAttribute('aria-checked')!=='true';
    ltSw.setAttribute('aria-checked',on);$('.lt-t',ltSw).textContent=on?'Lights on':'Lights off';
    $('#niche').classList.toggle('off',!on);
  });
  dots.forEach(function(d,i){d.addEventListener('click',function(){if(i!==front){var dr=i>front?1:-1;front=i;setFan(dr)}})});
  function stepFan(dr){front=(front+dr+4)%4;setFan(dr)}
  var nicheEl=$('#niche'),fx=null,fy=0;
  nicheEl.addEventListener('click',function(){stepFan(1)});
  nicheEl.addEventListener('touchstart',function(e){fx=e.touches[0].clientX;fy=e.touches[0].clientY},{passive:true});
  nicheEl.addEventListener('touchend',function(e){if(fx===null)return;var dx=e.changedTouches[0].clientX-fx,dy=e.changedTouches[0].clientY-fy;fx=null;if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)*1.2){e.preventDefault();stepFan(dx<0?1:-1)}});
  setFan(0);

  /* philosophy quote: words light up as you scroll */
  (function(){
    var q=$('.quote blockquote'),sec=$('.quote');if(!q)return;
    var words=q.textContent.trim().split(/\s+/);
    q.innerHTML=words.map(function(w){return '<span class="wd">'+esc(w)+'</span> '}).join('');
    var spans=$$('.wd',q),tick=0;
    function upd(){
      tick=0;var r=sec.getBoundingClientRect(),vh=window.innerHeight;
      var pr=Math.min(1,Math.max(0,(vh*.9-r.top-r.height*.15)/(r.height*.55)));
      var n=Math.round(pr*spans.length);
      spans.forEach(function(w,i){w.classList.toggle('lit',i<n)});
    }
    window.addEventListener('scroll',function(){if(!tick)tick=requestAnimationFrame(upd)},{passive:true});
    window.addEventListener('resize',upd);upd();
  })();

  /* testimonials */
  var tt=$('#ttrack'),ts=$$('.tc',tt),ti=0;
  function tUpdate(){
    var step=ts[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(tt).columnGap)||120);
    tt.style.transform='translateX('+(-ti*step)+'px)';
    ts.forEach(function(s,k){s.classList.toggle('on',k===ti);var v=$('video',s);if(v){if(k===ti){var pl=v.play();if(pl&&pl.catch)pl.catch(function(){})}else v.pause()}});
  }
  $('#tprev').addEventListener('click',function(){ti=(ti-1+ts.length)%ts.length;tUpdate()});
  $('#tnext').addEventListener('click',function(){ti=(ti+1)%ts.length;tUpdate()});
  ts.forEach(function(s,k){s.addEventListener('click',function(){if(k!==ti){ti=k;tUpdate()}})});
  window.addEventListener('resize',tUpdate);window.addEventListener('load',tUpdate);tUpdate();
  requestAnimationFrame(function(){requestAnimationFrame(function(){tt.classList.add('ready')})});
  var sx=null;
  tt.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  tt.addEventListener('touchend',function(e){if(sx===null)return;var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50){ti=Math.min(ts.length-1,Math.max(0,ti+(d<0?1:-1)));tUpdate()}sx=null});

  /* count-up numbers */
  (function(){
    var els=$$('.cnt');if(!els.length)return;
    function fmt(n){return n.toLocaleString('en-US')}
    function run(el){
      var to=+el.dataset.to,suf=el.dataset.suf||'',t0=null,dur=1800;
      function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(to*e))+suf;if(p<1)requestAnimationFrame(step)}
      el.textContent='0'+suf;requestAnimationFrame(step);
    }
    if(reduce||!('IntersectionObserver' in window))return;
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){o.unobserve(e.target);run(e.target)}})},{threshold:.4});
    els.forEach(function(el){o.observe(el)});
  })();

  /* why homworks: expandable feature list */
  (function(){
    var l=$('#wlist'),b=$('#wmore');if(!l||!b)return;
    var base=null;
    b.addEventListener('click',function(){
      var open=l.classList.toggle('open');b.setAttribute('aria-expanded',open);
      if(base===null)base=getComputedStyle(l).maxHeight;
      l.style.maxHeight=open?l.scrollHeight+'px':'';
      $('span',b).textContent=open?'Show fewer':'See all features';
    });
  })();

  /* FAQ */
  $$('.qa button').forEach(function(b){b.addEventListener('click',function(){var q=b.parentNode,o=q.classList.toggle('open');b.setAttribute('aria-expanded',o)})});

  /* lead form (front-end only, as on the previous homepage) */
  var form=$('#leadForm');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var bad=$$('[required]',form).filter(function(f){return !f.value.trim()||(f.type==='email'&&!/^\S+@\S+\.\S+$/.test(f.value))});
    $$('input',form).forEach(function(f){f.style.borderColor=''});
    if(bad.length){bad.forEach(function(f){f.style.borderColor='#d9534f'});bad[0].focus();return}
    $('#ok').classList.add('show');
    $('button[type=submit]',form).firstChild.textContent='Request received ';
  });
})();
