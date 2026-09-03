(function(){
  const D=window.WT_V1_DATE,S=window.WT_V1_STORAGE,C=window.WT_V1_CONFIG;

  function uid(){return crypto?.randomUUID?.()||String(Date.now()+Math.random());}

  function createApi(initialState,onChange){
    let state=S.normalize(initialState);

    function commit(syncExternal=true){
      if(syncExternal){
        const latest=S.load();
        state.plantProgress=latest.plantProgress;
        state.engagement=latest.engagement;
      }
      state=S.save(state);
      onChange?.(state);
      window.dispatchEvent(new CustomEvent('wt-data-changed',{detail:{source:'hydration'}}));
      return state;
    }
    function getState(){return state;}
    function isFutureDay(key){return String(key)>D.dayKey();}
    function assertEditableDay(key){if(isFutureDay(key))throw new Error('Future days cannot be edited.');}
    function goalFor(key=D.dayKey()){
      const s=state.settings;
      if(s.goalMode==='weekdayWeekend'){
        const day=D.dateFromKey(key).getDay();
        return Number(day===0||day===6?s.weekendGoal:s.weekdayGoal);
      }
      return Number(s.dailyGoal);
    }
    function ensureDay(key=D.dayKey()){
      if(!state.days[key])state.days[key]={drinks:[]};
      if(!Array.isArray(state.days[key].drinks))state.days[key].drinks=[];
      return state.days[key];
    }
    function drinksFor(key=D.dayKey()){return state.days[key]?.drinks||[];}
    function totalFor(key=D.dayKey()){return drinksFor(key).reduce((sum,d)=>sum+Number(d.oz||0),0);}
    function backupDay(key=D.dayKey()){
      assertEditableDay(key);
      state.backups[key]=JSON.parse(JSON.stringify(ensureDay(key)));
      Object.keys(state.backups).sort().slice(0,-30).forEach(k=>delete state.backups[k]);
    }
    function addDrink(oz,label='Quick add',key=D.dayKey(),at=null){
      assertEditableDay(key);
      const amount=Number(oz);
      if(!Number.isFinite(amount)||amount<1||amount>C.maxDrinkOz)throw new Error(`Enter an amount between 1 and ${C.maxDrinkOz} oz.`);
      backupDay(key);
      ensureDay(key).drinks.push({id:uid(),oz:amount,label:String(label||'Drink').slice(0,80),at:at||D.isoForDay(key)});
      commit();
      return {amount,total:totalFor(key),goal:goalFor(key),key};
    }
    function undoToday(){
      const key=D.dayKey(),day=ensureDay(key);
      if(!day.drinks.length)return null;
      backupDay(key);
      const removed=day.drinks.pop();
      commit();
      return removed;
    }
    function deleteDrink(key,id){
      assertEditableDay(key);
      const day=ensureDay(key),before=day.drinks.length;
      if(!day.drinks.some(d=>d.id===id))return false;
      backupDay(key);
      day.drinks=day.drinks.filter(d=>d.id!==id);
      if(day.drinks.length===before)return false;
      commit();return true;
    }
    function resetDay(key=D.dayKey()){assertEditableDay(key);backupDay(key);state.days[key]={drinks:[]};commit();}
    function restoreDay(key=D.dayKey()){
      assertEditableDay(key);
      if(!state.backups[key])return false;
      state.days[key]=JSON.parse(JSON.stringify(state.backups[key]));commit();return true;
    }
    function saveCup(cup){
      const next={id:cup.id||uid(),name:String(cup.name||'').trim(),oz:Number(cup.oz)};
      if(!next.name||!Number.isFinite(next.oz)||next.oz<1||next.oz>C.maxCupOz)throw new Error(`Enter a cup name and an amount between 1 and ${C.maxCupOz} oz.`);
      next.name=next.name.slice(0,40);
      const i=state.cups.findIndex(c=>c.id===next.id);
      if(i>=0)state.cups[i]=next;else state.cups.push(next);
      commit();return next;
    }
    function deleteCup(id){state.cups=state.cups.filter(c=>c.id!==id);commit();}
    function saveSettings(settings){state.settings=S.validateSettingsInput(settings,state.settings);commit();}
    function replaceState(next){state=S.normalize(next);commit(false);}

    return {getState,goalFor,isFutureDay,ensureDay,drinksFor,totalFor,addDrink,undoToday,deleteDrink,resetDay,restoreDay,saveCup,deleteCup,saveSettings,replaceState};
  }

  window.WT_V1_HYDRATION={createApi};
})();
