(function(){
const K='waterTracker_goalCelebrated_v1';
function done(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch{return{}}}
function save(x){localStorage.setItem(K,JSON.stringify(x))}
function total(k){return(state.days[k]?.drinks||[]).reduce((a,d)=>a+Number(d.oz||0),0)}
function burst(){let b=document.createElement('div');b.className='goalBurst';b.innerHTML='<span>🎉</span><strong>Goal reached!</strong><div>You kept your streak alive.</div>';document.body.appendChild(b);setTimeout(()=>b.remove(),3600);try{navigator.vibrate?.([30,40,30]);celebrateGoal();trackEvent('goal_celebration',{feature:'Engagement',day:dayKey()});}catch{}}
function check(){let k=dayKey(),d=done();if(d[k])return;if(total(k)>=goalFor(k)){d[k]=Date.now();save(d);burst();}}
let old=window.render||render;window.render=function(){old();setTimeout(check,80)};setTimeout(check,500);
})();