/* Homworks inner pages: nav, reading progress, section rail, scroll reveals, count-ups, parallax, swipe rails,
   hover rows, sticky story, timeline, FAQ rows + search, front-end form. */
(function(){
  'use strict';
  window.__hw5=true;
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var HAS_IO='IntersectionObserver' in window;

  /* nav: hides on a real scroll down, returns on scroll up */
  var nav=$('#nav'),burger=$('#burger'),mnav=$('#mnav'),lastY=window.scrollY,userAt=0;
  ['wheel','touchstart','touchmove','keydown','mousedown','click'].forEach(function(ev){window.addEventListener(ev,function(){userAt=performance.now()},{passive:true,capture:true})});
  function navScroll(){
    var y=Math.max(0,window.scrollY),dy=y-lastY,mine=performance.now()-userAt<900;
    if(y<=10||mnav.classList.contains('show'))nav.classList.remove('hide');
    else if(mine){if(dy>4&&y>nav.offsetHeight)nav.classList.add('hide');else if(dy<-4)nav.classList.remove('hide')}
    lastY=y;
  }
  burger.addEventListener('click',function(){var o=mnav.classList.toggle('show');burger.setAttribute('aria-expanded',o);nav.classList.toggle('menu-open',o);nav.classList.remove('hide')});
  $$('a',mnav).forEach(function(a){a.addEventListener('click',function(){mnav.classList.remove('show');nav.classList.remove('menu-open');burger.setAttribute('aria-expanded','false')})});

  /* reading progress */
  var bar=$('#rprog i');
  function progress(){var h=document.documentElement.scrollHeight-window.innerHeight;if(bar)bar.style.width=(h>0?Math.min(100,window.scrollY/h*100):0)+'%'}

  /* scroll reveals (+ staggered children) */
  $$('.stagger').forEach(function(g){Array.prototype.forEach.call(g.children,function(c,i){c.style.transitionDelay=(Math.min(i,8)*.09)+'s'})});
  if(HAS_IO){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -6% 0px'});
    $$('.rv,.rv-clip').forEach(function(el){io.observe(el)});
  }else $$('.rv,.rv-clip').forEach(function(el){el.classList.add('in')});

  /* numbers count up from 0 */
  (function(){
    var els=$$('.cnt');if(!els.length)return;
    function fmt(n,c){return c?n.toLocaleString('en-US'):String(n)}
    function run(el){
      var to=+el.getAttribute('data-to'),c=el.hasAttribute('data-c'),t0=null,dur=Math.min(2200,900+to*3);
      function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/dur),k=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(to*k),c);if(p<1)requestAnimationFrame(step)}
      el.textContent='0';requestAnimationFrame(step);
    }
    if(reduce||!HAS_IO)return;
    els.forEach(function(el){el.textContent='0'});
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){o.unobserve(e.target);run(e.target)}})},{threshold:.3});
    els.forEach(function(el){o.observe(el)});
  })();

  /* parallax (photo drifts slower than the page) */
  var par=$$('[data-par]'),parTick=0;
  function parallax(){
    parTick=0;if(reduce)return;var vh=window.innerHeight;
    par.forEach(function(el){var r=el.parentNode.getBoundingClientRect();if(r.bottom<-80||r.top>vh+80)return;var c=(r.top+r.height/2-vh/2)/vh;el.style.setProperty('--py',(c*-70).toFixed(1)+'px')});
  }

  /* swipe rails: arrows + mouse drag */
  $$('.rail2').forEach(function(rl){
    var vp=$('.rail2-vp',rl),down=false,sx=0,sl=0,moved=false;
    $$('.rail2-ar button',rl).forEach(function(b){b.addEventListener('click',function(){vp.scrollBy({left:(+b.getAttribute('data-d'))*Math.max(280,vp.clientWidth*.7),behavior:'smooth'})})});
    vp.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=vp.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5){moved=true;vp.classList.add('drag')}if(moved)vp.scrollLeft=sl-dx});
    window.addEventListener('pointerup',function(){if(down){down=false;vp.classList.remove('drag')}});
    vp.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
  });

  /* rows: hover a line to see its photo */
  $$('.rows').forEach(function(rw){
    var lis=$$('.rw',rw),figs=$$('.rows-pv figure',rw);
    function set(i){lis.forEach(function(l){l.classList.toggle('on',+l.getAttribute('data-i')===i)});figs.forEach(function(f){f.classList.toggle('on',+f.getAttribute('data-i')===i)})}
    lis.forEach(function(l){var i=+l.getAttribute('data-i');l.addEventListener('mouseenter',function(){set(i)});l.addEventListener('focusin',function(){set(i)})});
  });

  /* sticky story: the photo follows the step in view */
  if(HAS_IO)$$('.stky').forEach(function(s){
    var bl=$$('.sb',s),ims=$$('.stky-fr img',s);
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=+e.target.getAttribute('data-i');bl.forEach(function(b){b.classList.toggle('on',b===e.target)});ims.forEach(function(m){m.classList.toggle('on',+m.getAttribute('data-i')===i)})}})},{rootMargin:'-42% 0px -42% 0px'});
    bl.forEach(function(b){o.observe(b)});
  });

  /* timeline: the line fills as you read */
  var tls=$$('.tlv');
  function timeline(){
    var mid=window.innerHeight*.62;
    tls.forEach(function(t){
      var r=t.getBoundingClientRect(),p=Math.min(1,Math.max(0,(mid-r.top)/r.height));
      t.style.setProperty('--p',p.toFixed(3));
      $$('.tv',t).forEach(function(it){it.classList.toggle('on',it.getBoundingClientRect().top<mid)});
    });
  }

  /* one scroll handler for everything that follows scroll */
  var tick=0;
  function onScroll(){
    navScroll();
    if(!tick)tick=requestAnimationFrame(function(){tick=0;progress();parallax();timeline()});
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){progress();parallax();timeline()});
  progress();parallax();timeline();

  /* FAQ rows, topic rail and search */
  $$('.qa button').forEach(function(b){b.addEventListener('click',function(){var q=b.parentNode,o=q.classList.toggle('open');b.setAttribute('aria-expanded',o)})});
  var fs=$('#faqSearch');
  if(fs)fs.addEventListener('input',function(){
    var q=fs.value.trim().toLowerCase(),any=false;
    $$('#faqAll .qa').forEach(function(qa){var m=!q||qa.textContent.toLowerCase().indexOf(q)>-1;qa.hidden=!m;if(m)any=true});
    $$('#faqAll .faqg').forEach(function(g){g.hidden=!$$('.qa:not([hidden])',g).length});
    var none=$('.fnone');if(none)none.hidden=any;
  });
  var side=$$('.fside a');
  if(side.length&&HAS_IO){
    var fo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)side.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'-30% 0px -60% 0px'});
    $$('#faqAll .faqg').forEach(function(g){fo.observe(g)});
  }

  /* front-end form (same behaviour as the homepage form) */
  var form=$('#leadForm');
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    var bad=$$('[required]',form).filter(function(f){return !f.value.trim()||(f.type==='email'&&!/^\S+@\S+\.\S+$/.test(f.value))});
    $$('input,select',form).forEach(function(f){f.style.borderColor=''});
    if(bad.length){bad.forEach(function(f){f.style.borderColor='#d9534f'});bad[0].focus();return}
    $('#ok').classList.add('show');
  });
})();
