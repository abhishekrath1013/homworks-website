/* Homworks inner pages: nav behaviour, scroll reveal, FAQ rows, front-end form (same behaviour as the homepage). */
(function(){
  'use strict';
  window.__hw5=true;
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  var nav=$('#nav'),burger=$('#burger'),mnav=$('#mnav'),lastY=window.scrollY,userAt=0;
  ['wheel','touchstart','touchmove','keydown','mousedown','click'].forEach(function(ev){window.addEventListener(ev,function(){userAt=performance.now()},{passive:true,capture:true})});
  function onScroll(){
    var y=Math.max(0,window.scrollY),dy=y-lastY,mine=performance.now()-userAt<900;
    if(y<=10||mnav.classList.contains('show'))nav.classList.remove('hide');
    else if(mine){if(dy>4&&y>nav.offsetHeight)nav.classList.add('hide');else if(dy<-4)nav.classList.remove('hide')}
    lastY=y;
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  burger.addEventListener('click',function(){var o=mnav.classList.toggle('show');burger.setAttribute('aria-expanded',o);nav.classList.toggle('menu-open',o);nav.classList.remove('hide')});
  $$('a',mnav).forEach(function(a){a.addEventListener('click',function(){mnav.classList.remove('show');nav.classList.remove('menu-open');burger.setAttribute('aria-expanded','false')})});

  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    $$('.rv').forEach(function(el){io.observe(el)});
  }else $$('.rv').forEach(function(el){el.classList.add('in')});

  $$('.qa button').forEach(function(b){b.addEventListener('click',function(){var q=b.parentNode,o=q.classList.toggle('open');b.setAttribute('aria-expanded',o)})});

  var form=$('#leadForm');
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    var bad=$$('[required]',form).filter(function(f){return !f.value.trim()||(f.type==='email'&&!/^\S+@\S+\.\S+$/.test(f.value))});
    $$('input,select',form).forEach(function(f){f.style.borderColor=''});
    if(bad.length){bad.forEach(function(f){f.style.borderColor='#d9534f'});bad[0].focus();return}
    $('#ok').classList.add('show');
  });
})();
