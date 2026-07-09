(function(){
const A=[['first','💧','First Sip'],['goal1','🎯','Goal Getter'],['s3','🔥','3-Day Spark'],['s7','🏆','Perfect Week'],['oz500','🌊','500 oz Club'],['oz1000','🚰','1,000 oz Club'],['early','🌅','Early Start'],['manual','↩️','Back on Track']];
function es(){try{return JSON.parse(localStorage.getItem('waterTracker_engagement_v1')||'{"u":{}}')}catch{return{u:{}}}}
function ss(x){localStorage.setItem('waterTracker_engagement_v1',JSON.stringify(x))}
function met(id,s){return id==='first'?s.drinks>0:id==='goal1'?s.goals>0:id==='s3'?s.best>=3:id==='s7'?s.best>=7:id==='oz500'?s.oz>=500:id==='oz1000'?s.oz>=1000:id==='early'?s.early>0:id==='manual'?s.manual>0:false}
function st(){let oz=0,drinks=0,goals=0,early=0,manual=0;Object.keys(state.days||{}).forEach(k=>{let ds=state.days[k].drinks||[];let t=ds.reduce((a,d)=>a+Number(d.oz||0),0);oz+=t;drinks+=ds.length;if(t>=goalFor(k))goals++;ds.forEach(d=>{if(new Date(d.at).getHours()<9)early++;if(d.label==='Manual edit')manual++;});});let r=streaks();return{oz,drinks,goals,early,manual,best:r.best};}
function run(){let s=st(),e=es(),changed=false;A.forEach(a=>{if(!e.u[a[0]]&&met(a[0],s)){e.u[a[0]]=Date.now();changed=true;try{toast(a[1]+' Achievement unlocked: '+a[2],3500);trackEvent('achievement_unlocked',{feature:'Engagement',achievement:a[0],name:a[2]});}catch{}}});if(changed)ss(e);}
let old=window.render||render;window.render=function(){old();setTimeout(run,50)};setTimeout(run,500);
})();