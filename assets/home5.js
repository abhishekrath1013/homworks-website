/* Homworks homepage interactions (Landing 5) */
(function(){
  'use strict';
  window.__hw5=true;
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* nav */
  var nav=$('#nav'),burger=$('#burger'),mnav=$('#mnav');
  function onScroll(){nav.classList.toggle('scrolled',window.scrollY>10)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  burger.addEventListener('click',function(){var o=mnav.classList.toggle('show');burger.setAttribute('aria-expanded',o)});
  $$('a',mnav).forEach(function(a){a.addEventListener('click',function(){mnav.classList.remove('show');burger.setAttribute('aria-expanded','false')})});


  /* hero: drag anywhere to compare before / after */
  (function(){
    var hero=$('.hero'),bg=$('#heroBg'),ln=$('#hLine'),before=$('.hero-before'),grab=$('.hero-grab');
    if(!bg)return;
    var SLOPE=20.9,mid=52.15,drag=false,raf=0;
    function set(m){
      mid=Math.min(96,Math.max(4,m));
      var t=mid+SLOPE/2,b=mid-SLOPE/2;
      var f=function(a,bb,w){return 'polygon('+(a-w)+'% 0,'+(a+w)+'% 0,'+(bb+w)+'% 100%,'+(bb-w)+'% 100%)'};
      var cp='polygon(0 0,'+t+'% 0,'+b+'% 100%,0 100%)';
      before.style.clipPath=cp;before.style.webkitClipPath=cp;
      grab.style.clipPath=f(t,b,5);
      ln.setAttribute('x1',t);ln.setAttribute('x2',b);bg.setAttribute('aria-valuenow',Math.round(mid));
    }
    function move(e){var r=bg.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}
    hero.addEventListener('pointerdown',function(e){
      if(e.button>0||e.target.closest('a,button'))return;
      drag=true;cancelAnimationFrame(raf);try{hero.setPointerCapture(e.pointerId)}catch(x){}move(e);
    });
    hero.addEventListener('pointermove',function(e){if(drag)move(e)});
    function end(){drag=false}
    hero.addEventListener('pointerup',end);hero.addEventListener('pointercancel',end);
    bg.addEventListener('keydown',function(e){
      if(e.key==='ArrowLeft'||e.key==='ArrowDown'){set(mid-4);e.preventDefault()}
      else if(e.key==='ArrowRight'||e.key==='ArrowUp'){set(mid+4);e.preventDefault()}
      else if(e.key==='Home'){set(4)}else if(e.key==='End'){set(96)}
    });
    set(mid);
    if(!reduce){ /* brief demo sweep so people notice it is draggable */
      var t0=null;
      setTimeout(function(){
        function step(ts){
          if(drag)return;if(t0===null)t0=ts;var k=(ts-t0)/2200;
          if(k>=1){set(52.15);return}
          set(52.15+Math.sin(k*Math.PI*2)*14*(1-k*.4));raf=requestAnimationFrame(step);
        }
        raf=requestAnimationFrame(step);
      },2600);
    }
  })();

  /* reveal on scroll */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    $$('.rv').forEach(function(el){io.observe(el)});
  }else $$('.rv').forEach(function(el){el.classList.add('in')});

  /* how it works: accordion + preview */
  var stages=$$('.stage'),pvImgs=$$('.pv-img img'),styleCard=$('#styleCard');
  function openStage(i){
    stages.forEach(function(s,k){var on=k===i;s.classList.toggle('open',on);$('.stage-btn',s).setAttribute('aria-expanded',on)});
    pvImgs.forEach(function(im,k){im.classList.toggle('on',k===i)});
    styleCard.classList.toggle('off',i!==0);
  }
  stages.forEach(function(s,i){$('.stage-btn',s).addEventListener('click',function(){openStage(i)})});
  var tiles=$$('#tiles .tile'),pfill=$('#pfill');
  tiles.forEach(function(t){
    t.addEventListener('mouseenter',function(){tiles.forEach(function(x){x.classList.remove('on')});t.classList.add('on');pfill.style.width=t.dataset.p+'%'});
  });

  /* what we design: expanding cards (autoplay) that also drive the lower showcase */
  var P=[
    {h:'One plan for every room',p:'One cohesive plan for every room, with one team accountable from the first design to final handover.',pills:['Kitchen','Bedrooms','Living room','Pooja room','Home office','Dining'],link:['Explore full home interiors','full-home-interiors.html'],cards:[
      ['full-home-interiors.html','home/home-office.jpg','Home office','A bright, light place to think and create – a minimal, stylish and elegant office with sleek interiors of your choice.'],
      ['foyer-pooja-units.html','home/pooja-room.jpg','Pooja room','Designed with vastu for prayer and meditation – a peaceful interior that brings a positive vibration to your home.'],
      ['full-home-interiors.html','home/dining.jpg','Dining','“The family that eats together stays together.” Spacious or compact, with every inch detailed and well designed.'],
      ['full-home-interiors.html','home/vanity.jpg','Vanity','A perfectly blended vanity brings out the beauty of the room – a timeless contemporary style for your home.']]},
    {h:'Styles for your entertainment space',p:'Console units, partitions, wall panels and TV units – cabinets are the most underrated, trend-making part of a living room.',pills:['Console units','Living partitions','Wall panels','TV units'],link:['Explore living rooms','living-rooms.html'],cards:[
      ['living-rooms.html','home/living-console.jpg','Console unit','A definite eye-catcher, in many styles.'],
      ['living-rooms.html','home/living-partition.jpg','Living partition','Decor at its finest – it can make or break your living room’s style.'],
      ['living-rooms.html','home/living-wall-panel.jpg','Wall panel','Exquisite panelling that ties the whole room together.'],
      ['tv-units.html','home/tv-floor-standing.jpg','TV unit · floor-standing','Low cabinets on a baseboard, for a contemporary look.'],
      ['tv-units.html','home/tv-wall-hung.jpg','TV unit · wall-hung','Floating cabinets that leave the floor clear; a plinth can be added.']]},
    {h:'The kitchen of your dreams',p:'Once only a place to cook, the kitchen is now where families gather. Choose from six layouts in six styles, shaped around the people who use it.',pills:['Indian Classic','Contemporary','Indian Traditional','Minimalistic','Modern','English Classic'],link:['Explore modular kitchens','modular-kitchens.html'],cards:[
      ['kitchen-l-shaped.html','home/kitchen-l-shaped.jpg','L-shaped','A popular corner layout with an efficient work triangle and room for an island.',['#b4a9a0','#756d69','#534b46','#ce9f6c']],
      ['kitchen-u-shaped.html','home/kitchen-u-shaped.jpg','U-shaped','Three-sided cabinetry saves space and adds storage for shared cooking.',['#b59f8c','#6f6e6c','#73675f','#50422b']],
      ['kitchen-galley.html','home/kitchen-galley.jpg','Galley','Facing walls maximize storage and create an efficient work triangle in narrow spaces.',['#d4c9c3','#8b746c','#7f6c63','#9a5b3f']],
      ['kitchen-one-wall.html','home/kitchen-straight.jpg','One-wall','Every workstation along a single wall – simple, unobstructed and ideal for a smaller villa or condo.',['#dbd1ca','#6b6661','#222120','#473e38']],
      ['kitchen-peninsular.html','home/kitchen-peninsular.jpg','Peninsular','A U-shape with a connected extension – extra counter, a breakfast corner and a defined open-plan space.',['#b3aca4','#353236','#3f4860','#8a837d']],
      ['kitchen-island.html','home/kitchen-island.jpg','Island','Any layout, plus a freestanding island for prep, socialising and appliances.',['#cfc2b8','#7a5e49','#342718','#b8824e']]]},
    {h:'Foundation for your dreams',p:'Made from quality materials, our cots are the foundation for your sweet dreams – styled to suit your interior.',pills:['Cots','Headboards','Wardrobes',"Kids' rooms"],link:['Explore bedrooms','bedrooms.html'],cards:[
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
    $('#kitPills').innerHTML=d.pills.map(function(t){return '<a href="'+d.link[1]+'">'+esc(t)+'</a>'}).join('');
    var l=$('#kitLink');l.href=d.link[1];l.innerHTML='<span>'+esc(d.link[0])+'</span><span>›</span>';
    kt.innerHTML=d.cards.map(function(c){
      return '<a class="kcard" href="'+c[0]+'"><figure><img src="assets/'+c[1]+'" alt="'+esc(c[2])+'" loading="lazy"></figure><div><h3>'+esc(c[2])+'</h3><p>'+esc(c[3])+'</p>'+
        (c[4]?'<span class="pal">'+c[4].map(function(x){return '<i style="--c:'+x+'"></i>'}).join('')+'</span>':'')+'</div></a>'}).join('');
    kcards=$$('.kcard',kt);ki=0;kUpdate();
  }
  var cards=$('#cards'),cats=$$('.cat',cards),cur=cats.findIndex(function(c){return c.classList.contains('on')}),timer,shown=cur,DUR=6000;
  function showPanel(i){
    if(i===shown)return;shown=i;kitIn.classList.add('swap');
    setTimeout(function(){renderKit(P[i]);kitIn.classList.remove('swap')},280);
  }
  function setCat(i){
    cur=(i+cats.length)%cats.length;
    cats.forEach(function(c,k){c.classList.toggle('on',k===cur);var pr=$('.prog i',c);if(pr){pr.style.animation='none';void pr.offsetWidth;pr.style.animation=''}});
    showPanel(cur);
  }
  function play(){clearInterval(timer);if(reduce)return;timer=setInterval(function(){setCat(cur+1)},DUR)}
  cards.style.setProperty('--dur',DUR+'ms');
  cats.forEach(function(c,i){c.addEventListener('click',function(e){if(i!==cur){e.preventDefault();setCat(i);play()}})});
  var hold=false;
  function pause(){hold=true;cards.classList.add('paused');clearInterval(timer)}
  function resume(){hold=false;cards.classList.remove('paused');setCat(cur);play()}
  [cards,$('#kitchens')].forEach(function(el){el.addEventListener('mouseenter',pause);el.addEventListener('mouseleave',resume)});
  if('IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!hold){setCat(cur);play()}}else clearInterval(timer)})},{threshold:.35});
    cio.observe(cards);
  }else play();
  kp.addEventListener('click',function(){ki--;kUpdate()});
  kn.addEventListener('click',function(){ki++;kUpdate()});
  window.addEventListener('resize',kUpdate);
  renderKit(P[cur]);
  var tx=null;
  kt.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  kt.addEventListener('touchend',function(e){if(tx===null)return;var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40){ki+=d<0?1:-1;kUpdate()}tx=null});

  /* interior guide */
  var G=[
    ['Service drawings','Decide your furniture layout before you finalise plans for false ceilings, lighting, wall electricals, plumbing and gas pipelines – it avoids obstructed loft openings or wall damage during installation later on.'],
    ['Flooring','Decide on your finishes based on your existing flooring, so the design you dreamt of is the design you get.'],
    ['Painting','Choose your finishes before your paint colour. It gives a cohesive, pleasing look and makes sure the paint complements the design.'],
    ['Existing furniture','Tell your designer about the furniture you already own, so it can be integrated seamlessly – optimising design and function without compromise.'],
    ['Doors & window colour','Make sure your designer knows the colours of your internal doors and windows, so they blend into your interior palette.'],
    ['Wire management','Plan cable organisation as part of the installation, to prevent a chaotic network of cables – a tidy, clutter-free and safer space.'],
    ['TV sizes','Decide the TV model and size in advance. It sets the back-panel size, keeps wire management tidy and gives you the right viewing distance.'],
    ['Mattress & cot size','Ask your designer to explain the difference between cot size and mattress size – the terms vary from person to person. It avoids confusion in space planning and wall electrical points, and shows whether customisation is possible at this stage.'],
    ['Natural light','Consider the natural light entering each room before you choose finishes. Darker colours in a poorly lit space can feel cramped and push up daytime electricity use.'],
    ['Kitchen appliances','Tell your designer about the kitchen appliances you already have, to prevent service, access and safety issues – even the vent provisions can then be designed around them.'],
    ['Barrier-friendly design','A barrier-free environment allows free, safe movement, function and access for everyone, regardless of age, gender or condition. It’s the designer’s duty to ensure this before any other aspect of design.'],
    ['Budget','Set a realistic budget with your designer. Whether you are renovating a house or designing a new building, an accurate, well-thought-out budget is essential to the success of the project.']
  ];
  var gA=$('#glistA'),gB=$('#glistB'),gi=0,chips=[];
  G.forEach(function(g,i){
    var li=document.createElement('li'),n=('0'+(i+1)).slice(-2);
    li.innerHTML='<button type="button" class="chip2"><b>'+n+'</b><span>'+esc(g[0])+'</span></button>';
    (i<6?gA:gB).appendChild(li);chips.push($('button',li));
    $('button',li).addEventListener('click',function(){setGuide(i)});
  });
  function setGuide(i){
    gi=(i+G.length)%G.length;var n=('0'+(gi+1)).slice(-2),box=$('#gdText');
    chips.forEach(function(c,k){c.classList.toggle('on',k===gi)});
    $('#gdCount').textContent=n+' / 12';$('#gdNum').textContent=n;
    box.innerHTML='<h3>'+esc(G[gi][0])+'</h3><p>'+esc(G[gi][1])+'</p>';
    box.classList.remove('fade');void box.offsetWidth;box.classList.add('fade');
  }
  $('#gprev').addEventListener('click',function(){setGuide(gi-1)});
  $('#gnext').addEventListener('click',function(){setGuide(gi+1)});
  setGuide(0);

  /* testimonials */
  var tt=$('#ttrack'),ts=$$('.tslide',tt),ti=1;
  function tUpdate(){
    var sw=ts[0].getBoundingClientRect().width,vw=tt.parentNode.getBoundingClientRect().width;
    tt.style.transform='translateX('+((vw-sw)/2-ti*(sw+32))+'px)';
    ts.forEach(function(s,k){s.classList.toggle('on',k===ti)});
  }
  $('#tprev').addEventListener('click',function(){ti=(ti-1+ts.length)%ts.length;tUpdate()});
  $('#tnext').addEventListener('click',function(){ti=(ti+1)%ts.length;tUpdate()});
  ts.forEach(function(s,k){s.addEventListener('click',function(){if(k!==ti){ti=k;tUpdate()}})});
  window.addEventListener('resize',tUpdate);window.addEventListener('load',tUpdate);tUpdate();requestAnimationFrame(function(){requestAnimationFrame(function(){tt.classList.add('ready')})});
  var sx=null;
  tt.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  tt.addEventListener('touchend',function(e){if(sx===null)return;var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>50){ti=Math.min(ts.length-1,Math.max(0,ti+(d<0?1:-1)));tUpdate()}sx=null});

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
