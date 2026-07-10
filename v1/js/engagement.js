(function(){
  const D=window.WT_V1_DATE;
  const PERMANENT=[
    {id:'first',icon:'💧',name:'First Sip',description:'Log your first drink.',test:s=>s.totalDrinks>=1},
    {id:'goal1',icon:'🎯',name:'Goal Getter',description:'Meet your daily goal once.',test:s=>s.goalDays>=1},
    {id:'s3',icon:'🔥',name:'3-Day Spark',description:'Reach a 3-day streak.',test:s=>s.bestStreak>=3},
    {id:'s7',icon:'🏆',name:'Perfect Week',description:'Reach a 7-day streak.',test:s=>s.bestStreak>=7},
    {id:'oz500',icon:'🌊',name:'500 oz Club',description:'Log 500 lifetime ounces.',test:s=>s.lifetimeOz>=500},
    {id:'oz1000',icon:'🚰',name:'1,000 oz Club',description:'Log 1,000 lifetime ounces.',test:s=>s.lifetimeOz>=1000},
    {id:'early',icon:'🌅',name:'Early Start',description:'Log before 9 AM.',test:s=>s.earlyLogs>=1},
    {id:'manual',icon:'↩️',name:'Back on Track',description:'Edit a previous day.',test:s=>s.manualEdits>=1}
  ];
  const DAILY=[
    {id:'firstToday',icon:'💧',name:'First Drink Today',test:c=>c.drinks.length>0},
    {id:'earlyBird',icon:'🌅',name:'Early Bird',test:c=>c.drinks.some(d=>hour(d.at)<9)},
    {id:'halfway',icon:'☀️',name:'Halfway Before 2 PM',test:c=>c.total>=c.goal*.5&&c.nowHour<14},
    {id:'dailyGoal',icon:'🎯',name:'Daily Goal',test:c=>c.total>=c.goal}
  ];
  const PLANT_STAGES=[
    {name:'Seed',minGoalDays:0},
    {name:'Sprout',minGoalDays:3},
    {name:'Two Leaves',minGoalDays:6},
    {name:'Leafy Plant',minGoalDays:10},
    {name:'Bud',minGoalDays:15},
    {name:'First Flower',minGoalDays:21},
    {name:'More Flowers',minGoalDays:30},
    {name:'Full Bloom',minGoalDays:45}
  ];
  function hour(at){const d=new Date(at);return Number.isNaN(d.getTime())?99:d.getHours();}
  function scan(api){
    const state=api.getState();let lifetimeOz=0,totalDrinks=0,goalDays=0,earlyLogs=0,manualEdits=0;
    Object.keys(state.days).forEach(key=>{const drinks=api.drinksFor(key),total=api.totalFor(key);lifetimeOz+=total;totalDrinks+=drinks.length;if(total>=api.goalFor(key))goalDays++;drinks.forEach(d=>{if(hour(d.at)<9)earlyLogs++;if(d.label==='Manual edit')manualEdits++;});});
    const stats=window.WT_V1_STATS.calculate(api);return{lifetimeOz,totalDrinks,goalDays,earlyLogs,manualEdits,bestStreak:stats.bestStreak};
  }
  function evaluate(api){
    const state=api.getState(),eng=state.engagement,earned=[];const summary=scan(api);
    PERMANENT.forEach(a=>{if(!eng.permanent[a.id]&&a.test(summary)){eng.permanent[a.id]={count:1,firstEarnedAt:new Date().toISOString()};earned.push({...a,type:'permanent',count:1});}});
    const key=D.dayKey(),drinks=api.drinksFor(key),ctx={drinks,total:api.totalFor(key),goal:api.goalFor(key),nowHour:new Date().getHours()};
    eng.daily.earnedByDate[key]=eng.daily.earnedByDate[key]||{};
    DAILY.forEach(a=>{if(!eng.daily.earnedByDate[key][a.id]&&a.test(ctx)){eng.daily.earnedByDate[key][a.id]=Date.now();eng.daily.counts[a.id]=(eng.daily.counts[a.id]||0)+1;earned.push({...a,type:'daily',count:eng.daily.counts[a.id]});}});
    if(earned.length)window.WT_V1_STORAGE.save(state);return earned;
  }
  function allBadges(api){const e=api.getState().engagement;return[
    ...PERMANENT.map(a=>({...a,type:'One-time',count:e.permanent[a.id]?.count||0})),
    ...DAILY.map(a=>({...a,type:'Repeatable daily',count:e.daily.counts[a.id]||0}))
  ];}
  function todayWins(api){const got=api.getState().engagement.daily.earnedByDate[D.dayKey()]||{};return DAILY.map(a=>({...a,earned:Boolean(got[a.id]),count:api.getState().engagement.daily.counts[a.id]||0}));}
  function level(api){const oz=window.WT_V1_STATS.calculate(api).lifetimeOz;return{level:Math.floor(oz/500)+1,progress:oz%500,next:500};}
  function plant(api){
    const stats=window.WT_V1_STATS.calculate(api),goalDays=stats.goalDays;
    let stage=0;for(let i=0;i<PLANT_STAGES.length;i++)if(goalDays>=PLANT_STAGES[i].minGoalDays)stage=i;
    const today=api.totalFor(),goal=api.goalFor(),ratio=goal?today/goal:0;
    const moisture=ratio<=0?'dry':ratio<.4?'damp':ratio<1?'moist':'watered';
    const moistureText=moisture==='dry'?'Dry soil — log a drink to perk it up.':moisture==='damp'?'Damp soil — the plant is perking up.':moisture==='moist'?'Moist soil — healthy and happy.':'Fully watered today — great job!';
    const next=PLANT_STAGES[stage+1];
    return{stage,name:PLANT_STAGES[stage].name,goalDays,nextGoalDays:next?next.minGoalDays:null,moisture,moistureText,today,goal,ratio};
  }
  window.WT_V1_ENGAGEMENT={PERMANENT,DAILY,PLANT_STAGES,evaluate,allBadges,todayWins,level,plant};
})();