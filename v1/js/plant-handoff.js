(function(){
  const S=window.WT_V1_STORAGE,H=window.WT_V1_HYDRATION,P=window.WT_V1_PLANTS,D=window.WT_V1_DATE;
  let checking=false;
  function apiFor(state){return H.createApi(state,()=>{});}
  function goalDays(state){return window.WT_V1_STATS.calculate(apiFor(state)).goalDays;}
  function ensureCompletion(){
    if(checking)return false;checking=true;
    try{
      const state=S.load(),pp=state.plantProgress||{},life=P.progress(state,goalDays(state));
      if(!life.complete||pp.completionPending)return false;
      const completed=Array.isArray(pp.completedPlants)?pp.completedPlants:[];
      if(!completed.some(x=>(typeof x==='string'?x:x?.plantId)===life.plantId))completed.push({plantId:life.plantId,name:life.plant.name,completedAt:new Date().toISOString(),goalDays:life.goalDays});
      const pool=P.mysteryPool(completed.map(x=>typeof x==='string'?x:x?.plantId).filter(Boolean));
      const next=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
      pp.completedPlants=completed;
      pp.completionPending={plantId:life.plantId,plantName:life.plant.name,completedAt:new Date().toISOString(),goalDays:life.goalDays};
      pp.nextSeed=next?{plantId:next.id,awardedAt:new Date().toISOString()}:null;
      state.plantProgress=pp;S.save(state);
      window.dispatchEvent(new CustomEvent('wt-plant-render',{detail:{reason:'plant-complete'}}));
      return true;
    }finally{checking=false;}
  }
  function plantMysterySeed(){
    const state=S.load(),pp=state.plantProgress||{},seed=pp.nextSeed;
    if(!pp.completionPending||!seed?.plantId)return false;
    const next=P.definition(seed.plantId);
    if(!next||next.enabled===false)return false;
    const lifetime=goalDays(state);
    pp.currentPlantId=next.id;
    pp.startedAtGoalDays=lifetime;
    pp.startedAtDate=D.dayKey();
    pp.completionPending=null;
    pp.nextSeed=null;
    state.plantProgress=pp;S.save(state);
    window.dispatchEvent(new CustomEvent('wt-plant-render',{detail:{reason:'mystery-seed-planted'}}));
    window.dispatchEvent(new CustomEvent('wt-plant-handoff',{detail:{plantId:next.id,plantName:next.name}}));
    return next;
  }
  window.WT_V1_PLANT_HANDOFF={ensureCompletion,plantMysterySeed};
  window.addEventListener('wt-data-changed',()=>setTimeout(ensureCompletion,0));
  ensureCompletion();
})();