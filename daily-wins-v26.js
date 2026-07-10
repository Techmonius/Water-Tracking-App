(function(){
const KEY='waterTracker_dailyWins_v1';
const WINS=[['firstToday','💧','First Drink Today'],['earlyBird','🌅','Early Bird'],['halfway','☀️','Halfway Before 2 PM'],['dailyGoal','🎯','Daily Goal']];
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{"days":{},"counts":{}}')}catch{return{days:{},counts:{}}}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
function todayDrinks(){return state.days[dayKey()]?.drinks||[]}
function total(){return todayDrinks().reduce((a,d)=>a+Number(d.oz||0),0)}
function hour(d){let x=new Date(d.at||0);return isNaN(x.getTime())?99:x.getHours()}
function award(id,icon,name,x){let k=dayKey();x.days[k]=x.days[k]||{};if(x.days[k][id])return false;x.days[k][id]=Date.now();x.counts[id]=(x.counts[id]||0)+1;save(x);try{toast(icon+' Daily win: '+name,3200);trackEvent('daily_win_earned',{feature:'Engagement',achievement:id,name,count:x.counts[id]});}catch{}return true}
function check(){let x=load(),ds=todayDrinks(),oz=total(),g=goalFor(),now=new Date().getHours();if(ds.length)award('firstToday','💧','First Drink Today',x);if(ds.some(d=>hour(d)<9))award('earlyBird','🌅','Early Bird',x);if(oz>=g*.5&&now<14)award('halfway','☀️','Halfway Before 2 PM',x);if(oz>=g)award('dailyGoal','🎯','Daily Goal',x);renderWins(x)}
function renderWins(x){let card=document.getElementById('progressCard');if(!card)return;let old=card.querySelector('.winsBlock');if(old)old.remove();let k=dayKey(),day=x.days[k]||{},wrap=document.createElement('div');wrap.className='winsBlock';wrap.innerHTML='<div class="row" style="margin-top:14px"><h2>Today’s Wins</h2><button class="small" id="achievementMenuButton" type="button">All Badges</button></div><div class="winsRow">'+WINS.map(w=>'<div class="winChip '+(day[w[0]]?'done':'')+'">'+w[1]+' '+w[2]+'</div>').join('')+'</div>';card.appendChild(wrap);document.getElementById('achievementMenuButton').onclick=()=>window.openAchievementMenu?.();}
let old=window.render||render;window.render=function(){old();setTimeout(check,120)};setTimeout(check,650);
window.WT_DAILY_WINS={load,WINS};
})();