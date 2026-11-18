/* Homworks 30-day page: the hero dial and the scroll-driven clock. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};

  /* hero dial: the arc travels Day 0 -> Day 30, lighting the ticks and counting the days */
  var dial=$('[data-dial]');
  if(dial){
    var arc=$('.d-arc',dial),dot=$('.d-dot',dial),tks=$$('.tk',dial),num=$('.d-n',dial);
    function set(t){
      var a=t*360,r=270,rad=(a-90)*Math.PI/180;
      arc.style.strokeDashoffset=String(100-100*t);
      dot.setAttribute('cx',(300+r*Math.cos(rad)).toFixed(1));dot.setAttribute('cy',(300+r*Math.sin(rad)).toFixed(1));
      var d=Math.round(t*30);num.textContent=d;
      tks.forEach(function(k,i){k.classList.toggle('on',i<d||(d===30))});
    }
    if(reduce||!('IntersectionObserver' in window)){set(1)}
    else{
      set(0);
      var started=false,io=new IntersectionObserver(function(es){
        if(!es[0].isIntersecting||started)return;started=true;io.disconnect();
        var t0=null,dur=3400;
        (function step(ts){if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/dur);set(ease(p));if(p<1)requestAnimationFrame(step)})(performance.now());
      },{threshold:.35});
      setTimeout(function(){io.observe(dial)},350);
    }
  }

  /* the clock: scrolling through the tall section advances Day 0 -> Day 30 */
  var clk=$('[data-clk]');
  if(clk){
    var cells=$$('.dc',clk),n=$('.clk-n',clk),phs=$$('.ph',clk),bar=$('.clk-bar i',clk),lastDay=-1,tick=0;
    function upd(){
      tick=0;
      var r=clk.getBoundingClientRect(),vh=window.innerHeight,span=r.height-vh;
      var p=span>0?Math.min(1,Math.max(0,-r.top/span)):0;
      var day=Math.min(30,Math.round(p*30));
      bar.style.setProperty('--cp',p.toFixed(3));
      if(day===lastDay)return;lastDay=day;
      n.textContent=day;
      cells.forEach(function(c,i){c.classList.toggle('on',i<=day);c.classList.toggle('cur',i===day&&day>0&&day<30)});
      var k=day===0?0:day===30?2:1;
      phs.forEach(function(ph,i){ph.classList.toggle('on',i===k)});
    }
    function req(){if(!tick)tick=requestAnimationFrame(upd)}
    window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);
    upd();
  }

  /* the guarantee heading underlines itself when it arrives */
  var gq=$('.gar-q');
  if(gq&&'IntersectionObserver' in window){
    var go=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');go.unobserve(e.target)}})},{threshold:.4});
    go.observe(gq);
  }
})();
