(function(){
  const ENDPOINT='https://script.google.com/macros/s/AKfycbykCIKxRnB_gQC0IOHrl3X5wSfAdC6chsxeJQSlO1wsd762PlF_oWEvt5JDjH1xGIZb-A/exec';
  const C=window.WT_V1_CONFIG;
  function uid(){return crypto?.randomUUID?.()||String(Date.now()+Math.random());}
  function installId(){let id=localStorage.getItem(C.telemetryInstallKey);if(!id){id=uid();localStorage.setItem(C.telemetryInstallKey,id);}return id;}
  function device(){const u=navigator.userAgent||'';return/iPhone|iPad|iPod/i.test(u)?'iOS':/Android/i.test(u)?'Android':'Other';}
  function sessionId(){return sessionStorage.wtV1Session||(sessionStorage.wtV1Session=uid());}
  function reportContext(){
    const base={screen:document.querySelector('.view.active')?.id||'unknown',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'',locale:navigator.language||''};
    try{
      const S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION,ST=window.WT_V1_STATS,E=window.WT_V1_ENGAGEMENT;
      if(!S||!H||!ST)return base;
      const state=S.load(),api=H.createApi(state,()=>{}),stats=ST.calculate(api),plant=E?.plant?.(api),dailyWins=Object.values(state.engagement?.daily?.counts||{}).reduce((a,b)=>a+(Number(b)||0),0);
      return{...base,birthday:state.settings?.birthday||null,todayOz:api.totalFor(),todayGoal:api.goalFor(),goalMode:state.settings?.goalMode||'daily',lifetimeOz:Math.round(stats.lifetimeOz),goalDays:stats.goalDays,currentStreak:stats.currentStreak,bestStreak:stats.bestStreak,trackedDays:stats.daysTracked,plantId:plant?.plantId||state.plantProgress?.currentPlantId||'',plantStage:plant?.name||'',plantGoalDays:plant?.goalDays||0,completedPlants:(state.plantProgress?.completedPlants||[]).length,permanentBadges:Object.keys(state.engagement?.permanent||{}).length,dailyWinCount:dailyWins};
    }catch{return base;}
  }
  function track(event,data={}){
    const now=new Date(),context=reportContext();
    const payload={event,label:event.replaceAll('_',' '),summary:event.replaceAll('_',' '),data:{...data},installId:installId(),sessionId:sessionId(),version:C.appVersion,device:device(),standalone:Boolean(matchMedia?.('(display-mode: standalone)').matches),localDate:now.toLocaleDateString(),localTime:now.toLocaleTimeString(),timestamp:now.toISOString(),...context};
    try{fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});}catch{}
  }
  window.WT_V1_TELEMETRY={track,installId,reportContext};
})();
