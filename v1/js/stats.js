(function(){
  const D=window.WT_V1_DATE;
  function calculate(api){
    const state=api.getState(),today=D.dayKey(),keys=Object.keys(state.days||{}).filter(k=>k<=today).sort();
    let lifetimeOz=0,totalDrinks=0,goalDays=0,earlyLogs=0;let firstTimes=[],goalTimes=[];const labels={},hours={};
    keys.forEach(key=>{const drinks=api.drinksFor(key),total=api.totalFor(key),goal=api.goalFor(key);lifetimeOz+=total;totalDrinks+=drinks.length;if(goal>0&&total>=goal)goalDays++;const sorted=[...drinks].sort((a,b)=>new Date(a.at)-new Date(b.at));
      sorted.forEach(d=>{labels[d.label||'Drink']=(labels[d.label||'Drink']||0)+1;const dt=new Date(d.at);if(!Number.isNaN(dt.getTime()))hours[dt.getHours()]=(hours[dt.getHours()]||0)+1;});
      if(sorted[0]){const first=new Date(sorted[0].at);if(!Number.isNaN(first.getTime())){firstTimes.push(first.getHours()*60+first.getMinutes());if(first.getHours()<9)earlyLogs++;}}
      let running=0;for(const drink of sorted){running+=Number(drink.oz||0);if(goal>0&&running>=goal){const reached=new Date(drink.at);if(!Number.isNaN(reached.getTime()))goalTimes.push(reached.getHours()*60+reached.getMinutes());break;}}
    });
    const met=key=>{const goal=api.goalFor(key);return goal>0&&api.totalFor(key)>=goal;};
    let bestStreak=0,run=0;
    if(keys.length){
      let cursor=D.dateFromKey(keys[0]),end=D.dateFromKey(today);
      while(cursor<=end){const key=D.dayKey(cursor);run=met(key)?run+1:0;bestStreak=Math.max(bestStreak,run);cursor.setDate(cursor.getDate()+1);}
    }
    let currentStreak=0,cursor=D.dateFromKey(today);
    if(!met(today))cursor.setDate(cursor.getDate()-1);
    const earliest=keys.length?D.dateFromKey(keys[0]):null;
    while(earliest&&cursor>=earliest&&met(D.dayKey(cursor))){currentStreak++;cursor.setDate(cursor.getDate()-1);}
    const daysTracked=keys.filter(k=>api.drinksFor(k).length).length,avgDaily=daysTracked?lifetimeOz/daysTracked:0,completionRate=daysTracked?goalDays/daysTracked*100:0,avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null,time=m=>m==null?'—':new Date(2000,0,1,Math.floor(m/60),Math.round(m%60)).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}),top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
    const commonHour=top(hours);return{lifetimeOz,lifetimeGallons:lifetimeOz/128,totalDrinks,daysTracked,goalDays,completionRate,averageDailyOz:avgDaily,currentStreak,bestStreak,earlyLogDays:earlyLogs,averageFirstDrinkTime:time(avg(firstTimes)),averageGoalTime:time(avg(goalTimes)),favoriteLabel:top(labels),mostCommonHour:commonHour===''?'':new Date(2000,0,1,Number(commonHour)).toLocaleTimeString([], {hour:'numeric'}),level:Math.floor(lifetimeOz/500)+1,levelProgress:lifetimeOz%500};
  }
  window.WT_V1_STATS={calculate};
})();
