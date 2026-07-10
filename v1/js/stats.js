(function(){
  const D=window.WT_V1_DATE;

  function calculate(api){
    const state=api.getState();
    const keys=Object.keys(state.days||{}).sort();
    let lifetimeOz=0,totalDrinks=0,goalDays=0,earlyLogs=0;
    let firstTimes=[],goalTimes=[];

    keys.forEach(key=>{
      const drinks=api.drinksFor(key);
      const total=api.totalFor(key);
      const goal=api.goalFor(key);
      lifetimeOz+=total;
      totalDrinks+=drinks.length;
      if(total>=goal)goalDays++;
      const sorted=[...drinks].sort((a,b)=>new Date(a.at)-new Date(b.at));
      if(sorted[0]){
        const first=new Date(sorted[0].at);
        if(!Number.isNaN(first.getTime())){
          firstTimes.push(first.getHours()*60+first.getMinutes());
          if(first.getHours()<9)earlyLogs++;
        }
      }
      let running=0;
      for(const drink of sorted){
        running+=Number(drink.oz||0);
        if(running>=goal){
          const reached=new Date(drink.at);
          if(!Number.isNaN(reached.getTime()))goalTimes.push(reached.getHours()*60+reached.getMinutes());
          break;
        }
      }
    });

    let currentStreak=0,bestStreak=0,run=0;
    for(let i=365;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      const met=api.totalFor(D.dayKey(d))>=api.goalFor(D.dayKey(d));
      run=met?run+1:0;bestStreak=Math.max(bestStreak,run);
    }
    for(let i=0;i<365;i++){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=D.dayKey(d);
      if(api.totalFor(key)>=api.goalFor(key))currentStreak++;else break;
    }

    const daysTracked=keys.filter(k=>api.drinksFor(k).length).length;
    const avgDaily=daysTracked?lifetimeOz/daysTracked:0;
    const completionRate=daysTracked?goalDays/daysTracked*100:0;
    const avg=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;
    const time=(minutes)=>minutes==null?'—':new Date(2000,0,1,Math.floor(minutes/60),Math.round(minutes%60)).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});

    return{
      lifetimeOz,
      lifetimeGallons:lifetimeOz/128,
      totalDrinks,
      daysTracked,
      goalDays,
      completionRate,
      averageDailyOz:avgDaily,
      currentStreak,
      bestStreak,
      earlyLogDays:earlyLogs,
      averageFirstDrinkTime:time(avg(firstTimes)),
      averageGoalTime:time(avg(goalTimes)),
      level:Math.floor(lifetimeOz/500)+1,
      levelProgress:lifetimeOz%500
    };
  }

  window.WT_V1_STATS={calculate};
})();