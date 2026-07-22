(function(){
  const D=window.WT_V1_DATE;
  const R={common:25,uncommon:50,rare:100,epic:250,legendary:500};
  const A=(id,icon,name,description,category='General',rarity='common',test=()=>false)=>({id,icon,name,description,category,rarity,xp:R[rarity],test});
  const PERMANENT=[
    A('first','💧','First Sip','Log your first drink.','Milestones','common',s=>s.totalDrinks>=1),
    A('goal1','🎯','Goal Getter','Meet your daily goal once.','Milestones','common',s=>s.goalDays>=1),
    A('s3','🔥','3-Day Spark','Reach a 3-day streak.','Streaks','common',s=>s.bestStreak>=3),
    A('s7','🏆','Perfect Week','Reach a 7-day streak.','Streaks','uncommon',s=>s.bestStreak>=7),
    A('s14','🔥','Two-Week Flame','Reach a 14-day streak.','Streaks','rare',s=>s.bestStreak>=14),
    A('s30','🔥','Monthly Momentum','Reach a 30-day streak.','Streaks','epic',s=>s.bestStreak>=30),
    A('s50','🔥','Fifty Strong','Reach a 50-day streak.','Streaks','epic',s=>s.bestStreak>=50),
    A('s100','🔥','Century Streak','Reach a 100-day streak.','Streaks','legendary',s=>s.bestStreak>=100),
    A('s365','👑','Year of Water','Reach a 365-day streak.','Streaks','legendary',s=>s.bestStreak>=365),
    A('oz500','🌊','500 oz Club','Log 500 lifetime ounces.','Lifetime','common',s=>s.lifetimeOz>=500),
    A('oz1000','🚰','1,000 oz Club','Log 1,000 lifetime ounces.','Lifetime','uncommon',s=>s.lifetimeOz>=1000),
    A('oz10000','💧','10,000 oz','Log 10,000 lifetime ounces.','Lifetime','rare',s=>s.lifetimeOz>=10000),
    A('oz50000','🌊','50,000 oz','Log 50,000 lifetime ounces.','Lifetime','epic',s=>s.lifetimeOz>=50000),
    A('oz100000','🌊','100,000 oz','Log 100,000 lifetime ounces.','Lifetime','legendary',s=>s.lifetimeOz>=100000),
    A('drinks100','🥤','100 Drinks','Log 100 drinks.','Lifetime','uncommon',s=>s.totalDrinks>=100),
    A('drinks500','🥤','500 Drinks','Log 500 drinks.','Lifetime','rare',s=>s.totalDrinks>=500),
    A('drinks1000','🏅','1,000 Drinks','Log 1,000 drinks.','Lifetime','epic',s=>s.totalDrinks>=1000),
    A('early','🌅','Early Start','Log before 9 AM.','Habits','common',s=>s.earlyLogs>=1),
    A('manual','↩️','Back on Track','Edit a previous day.','Habits','common',s=>s.manualEdits>=1),
    A('plant1','🌱','First Sprout','Reach the Sprout plant stage.','Plant','common',s=>s.goalDays>=3),
    A('plant2','🌿','First Leaves','Reach the Two Leaves stage.','Plant','uncommon',s=>s.goalDays>=6),
    A('plant3','🍃','Leafy Plant','Reach the Leafy Plant stage.','Plant','uncommon',s=>s.goalDays>=10),
    A('plant4','🌷','First Bud','Reach the Bud stage.','Plant','rare',s=>s.goalDays>=15),
    A('plant5','🌸','First Flower','Reach the First Flower stage.','Plant','rare',s=>s.goalDays>=21),
    A('plant6','🌺','More Flowers','Reach the More Flowers stage.','Plant','epic',s=>s.goalDays>=30),
    A('plant7','💐','Full Bloom','Reach the Full Bloom stage.','Plant','legendary',s=>s.goalDays>=45),
    A('weekend','📆','Weekend Warrior','Log water on both Saturday and Sunday.','Consistency','uncommon',s=>s.weekendPairs>=1),
    A('perfectMonth','🗓️','Perfect Month','Meet every daily goal in one calendar month.','Consistency','legendary',s=>s.perfectMonths>=1),
    A('birthday','🎂','Birthday Hydration','Log water on your birthday.','Hidden','rare',s=>s.birthdayLogged),
    A('leap','🐸','Leap Day','Log water on February 29.','Hidden','epic',s=>s.leapDay),
    A('newyear','🎆','New Year Start','Meet your goal on January 1.','Hidden','rare',s=>s.newYearGoal),
    A('christmas','🎄','Holiday Hydration','Log water on December 25.','Hidden','rare',s=>s.christmasLogged)
  ];
  const DAILY=[
    A('firstToday','💧','First Drink Today','Log your first drink today.','Daily','common',c=>c.drinks.length>0),
    A('earlyBird','🌅','Early Bird','Log before 8 AM.','Daily','common',c=>c.drinks.some(d=>hour(d.at)<8)),
    A('morning32','☀️','Morning Hydration','Reach 32 oz before 10 AM.','Daily','uncommon',c=>c.total>=32&&c.nowHour<10),
    A('halfway','💪','Halfway There','Reach 50% of today’s goal.','Daily','common',c=>c.total>=c.goal*.5),
    A('dailyGoal','🎯','Goal Crusher','Reach today’s goal.','Daily','uncommon',c=>c.total>=c.goal),
    A('plus125','💦','Hydrated Plus','Reach 125% of today’s goal.','Daily','rare',c=>c.total>=c.goal*1.25),
    A('plus150','🏆','Hydration Beast','Reach 150% of today’s goal.','Daily','epic',c=>c.total>=c.goal*1.5),
    A('nightOwl','🌙','Night Owl','Log water after 9 PM.','Daily','common',c=>c.drinks.some(d=>hour(d.at)>=21)),
    A('steady','⏰','Steady Sipper','Log in at least five different hours.','Daily','uncommon',c=>new Set(c.drinks.map(d=>hour(d.at))).size>=5),
    A('smallSteps','🚰','Small Steps','Log at least eight drinks.','Daily','uncommon',c=>c.drinks.length>=8),
    A('exactGoal','⚖️','Perfect Pour','Finish exactly at your goal.','Daily','rare',c=>c.total===c.goal),
    A('century','💯','Century Club','Log exactly 100 oz.','Daily','rare',c=>c.total===100),
    A('lucky77','🎲','Lucky 77','Log exactly 77 oz.','Daily','rare',c=>c.total===77),
    A('bigGulp','🪣','Big Gulp','Log one drink of at least 40 oz.','Daily','uncommon',c=>c.drinks.some(d=>Number(d.oz)>=40)),
    A('tinySips','🥛','Tiny Sips','Log ten drinks under 4 oz.','Daily','rare',c=>c.drinks.filter(d=>Number(d.oz)<4).length>=10),
    A('midnight','🥷','Midnight Sip','Log between midnight and 1 AM.','Hidden','rare',c=>c.drinks.some(d=>hour(d.at)===0))
  ];
  const PLANT_STAGES=[{name:'Seed',minGoalDays:0},{name:'Sprout',minGoalDays:3},{name:'Two Leaves',minGoalDays:6},{name:'Leafy Plant',minGoalDays:10},{name:'Bud',minGoalDays:15},{name:'First Flower',minGoalDays:21},{name:'More Flowers',minGoalDays:30},{name:'Full Bloom',minGoalDays:45}];
  function hour(at){const d=new Date(at);return Number.isNaN(d.getTime())?99:d.getHours();}
  function scan(api){const state=api.getState();let lifetimeOz=0,totalDrinks=0,goalDays=0,earlyLogs=0,manualEdits=0,weekendPairs=0,perfectMonths=0,birthdayLogged=false,leapDay=false,newYearGoal=false,christmasLogged=false;const keys=Object.keys(state.days).sort();
    keys.forEach(key=>{const drinks=api.drinksFor(key),total=api.totalFor(key),goal=api.goalFor(key),d=D.dateFromKey(key);lifetimeOz+=total;totalDrinks+=drinks.length;if(total>=goal)goalDays++;drinks.forEach(x=>{if(hour(x.at)<9)earlyLogs++;if(x.label==='Manual edit')manualEdits++;});if(drinks.length&&d.getMonth()===1&&d.getDate()===29)leapDay=true;if(total>=goal&&d.getMonth()===0&&d.getDate()===1)newYearGoal=true;if(drinks.length&&d.getMonth()===11&&d.getDate()===25)christmasLogged=true;const b=state.settings.birthday;if(b&&drinks.length&&key.slice(5)===b.slice(5))birthdayLogged=true;});
    const set=new Set(keys.filter(k=>api.totalFor(k)>0));keys.forEach(k=>{const d=D.dateFromKey(k);if(d.getDay()===6){const n=new Date(d);n.setDate(n.getDate()+1);if(set.has(D.dayKey(n)))weekendPairs++;}});
    const months={};keys.forEach(k=>{const m=k.slice(0,7);(months[m]||(months[m]=[])).push(k);});Object.keys(months).forEach(m=>{const [y,mo]=m.split('-').map(Number),days=new Date(y,mo,0).getDate();if(months[m].filter(k=>api.totalFor(k)>=api.goalFor(k)).length===days)perfectMonths++;});
    const stats=window.WT_V1_STATS.calculate(api);return{lifetimeOz,totalDrinks,goalDays,earlyLogs,manualEdits,bestStreak:stats.bestStreak,weekendPairs,perfectMonths,birthdayLogged,leapDay,newYearGoal,christmasLogged};}
  function evaluate(api){const state=api.getState(),eng=state.engagement,earned=[],summary=scan(api);PERMANENT.forEach(a=>{if(!eng.permanent[a.id]&&a.test(summary)){eng.permanent[a.id]={count:1,firstEarnedAt:new Date().toISOString(),xp:a.xp};earned.push({...a,type:'permanent',count:1});}});const key=D.dayKey(),drinks=api.drinksFor(key),ctx={drinks,total:api.totalFor(key),goal:api.goalFor(key),nowHour:new Date().getHours()};eng.daily.earnedByDate[key]=eng.daily.earnedByDate[key]||{};DAILY.forEach(a=>{if(!eng.daily.earnedByDate[key][a.id]&&a.test(ctx)){eng.daily.earnedByDate[key][a.id]=Date.now();eng.daily.counts[a.id]=(eng.daily.counts[a.id]||0)+1;earned.push({...a,type:'daily',count:eng.daily.counts[a.id]});}});if(earned.length)window.WT_V1_STORAGE.save(state);return earned;}
  function allBadges(api){const e=api.getState().engagement;return[...PERMANENT.map(a=>({...a,type:'One-time',count:e.permanent[a.id]?.count||0,firstEarnedAt:e.permanent[a.id]?.firstEarnedAt||null})),...DAILY.map(a=>({...a,type:'Repeatable daily',count:e.daily.counts[a.id]||0}))];}
  function todayWins(api){const got=api.getState().engagement.daily.earnedByDate[D.dayKey()]||{};return DAILY.map(a=>({...a,earned:Boolean(got[a.id]),count:api.getState().engagement.daily.counts[a.id]||0}));}
  function level(api){const badges=allBadges(api),xp=badges.reduce((n,b)=>n+(b.count?b.xp*(b.type==='Repeatable daily'?b.count:1):0),0);return{level:Math.floor(xp/500)+1,progress:xp%500,next:500,xp};}
  function plant(api){const stats=window.WT_V1_STATS.calculate(api),goalDays=stats.goalDays;let stage=0;for(let i=0;i<PLANT_STAGES.length;i++)if(goalDays>=PLANT_STAGES[i].minGoalDays)stage=i;const today=api.totalFor(),goal=api.goalFor(),ratio=goal?today/goal:0,moisture=ratio<=0?'dry':ratio<.4?'damp':ratio<1?'moist':'watered',moistureText=moisture==='dry'?'Dry soil — log a drink to perk it up.':moisture==='damp'?'Damp soil — the plant is perking up.':moisture==='moist'?'Moist soil — healthy and happy.':'Fully watered today — great job!',next=PLANT_STAGES[stage+1];return{stage,name:PLANT_STAGES[stage].name,goalDays,nextGoalDays:next?next.minGoalDays:null,moisture,moistureText,today,goal,ratio};}
  window.WT_V1_ENGAGEMENT={PERMANENT,DAILY,PLANT_STAGES,evaluate,allBadges,todayWins,level,plant};
})();