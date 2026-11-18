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

  /* the clock: Days 0-29 play by themselves once it is on screen; scrolling on selects Day 30 */
  var clk=$('[data-clk]');
  if(clk){
    var cells=$$('.dc',clk),n=$('.clk-n',clk),phs=$$('.ph',clk),bar=$('.clk-bar i',clk);
    var DUR=5600,autoDay=0,autoDone=false,running=false,raf=0,shown=-1,wantFinal=false;
    function render(day){
      if(day===shown)return;shown=day;
      n.textContent=day;
      cells.forEach(function(c,i){c.classList.toggle('on',i<=day);c.classList.toggle('cur',i===day&&day>0&&day<30);c.classList.toggle('fin',i===30&&day===30)});
      var k=day===0?0:day===30?2:1;
      phs.forEach(function(ph,i){ph.classList.toggle('on',i===k)});
      bar.style.setProperty('--cp',(day/30).toFixed(3));
      clk.classList.toggle('hint',day===29);
    }
    function start(){
      if(running||autoDone)return;
      if(reduce){autoDay=29;autoDone=true;render(wantFinal?30:29);return}
      running=true;var t0=null;
      (function step(ts){
        if(!running)return;
        if(t0===null)t0=ts;
        var p=Math.min(1,(ts-t0)/DUR);
        autoDay=Math.min(29,Math.floor(p*30));
        render(wantFinal?30:autoDay);
        if(p<1)raf=requestAnimationFrame(step);else{running=false;autoDone=true;render(wantFinal?30:29)}
      })(performance.now());
    }
    function reset(){running=false;cancelAnimationFrame(raf);autoDay=0;autoDone=false;wantFinal=false;render(0)}
    var tick=0;
    function upd(){
      tick=0;
      var r=clk.getBoundingClientRect(),vh=window.innerHeight,span=r.height-vh;
      var p=span>0?Math.min(1,Math.max(0,-r.top/span)):0;
      if(r.top>vh*.98){reset();return}                       /* back above it: ready to replay */
      if(r.top<vh*.35&&r.bottom>vh*.6)start();                /* pinned on screen: play 0 -> 29 */
      var f=p>.45;                                            /* a little further scroll: Day 30 */
      if(f!==wantFinal){
        wantFinal=f;
        if(f&&!autoDone){running=false;cancelAnimationFrame(raf);autoDay=29;autoDone=true}
        render(f?30:(autoDone?29:autoDay));
      }
    }
    function req(){if(!tick)tick=requestAnimationFrame(upd)}
    window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);
    render(0);upd();
  }

  /* the guarantee heading underlines itself when it arrives */
  var gq=$('.gar-q');
  if(gq&&'IntersectionObserver' in window){
    var go=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');go.unobserve(e.target)}})},{threshold:.4});
    go.observe(gq);
  }
})();
