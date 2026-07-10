(function(){
  const D=window.WT_V1_DATE;

  function uid(){return crypto?.randomUUID?.()||String(Date.now()+Math.random());}

  function createApi(initialState,onChange){
    let state=window.WT_V1_STORAGE.normalize(initialState);

    function commit(){window.WT_V1_STORAGE.save(state);onChange?.(state);return state;}
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
      if(!Number.isFinite(amount)||amount<1)throw new Error('Enter a valid ounce amount.');
      backupDay(key);
      ensureDay(key).drinks.push({id:uid(),oz:amount,label,at:at||D.isoForDay(key)});
      commit();
      return {amount,total:totalFor(key),goal:goalFor(key),key};
    }
    function undoToday(){
      const day=ensureDay();
      const removed=day.drinks.pop();
      if(!removed)return null;
      backupDay();commit();return removed;
    }
    function deleteDrink(key,id){
      assertEditableDay(key);
      const day=ensureDay(key);
      const before=day.drinks.length;
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
      if(!next.name||!next.oz||next.oz<1)throw new Error('Enter a cup name and valid ounce amount.');
      const i=state.cups.findIndex(c=>c.id===next.id);
      if(i>=0)state.cups[i]=next;else state.cups.push(next);
      commit();return next;
    }
    function deleteCup(id){state.cups=state.cups.filter(c=>c.id!==id);commit();}
    function saveSettings(settings){state.settings={...state.settings,...settings};commit();}
    function replaceState(next){state=window.WT_V1_STORAGE.normalize(next);commit();}

    return {getState,goalFor,isFutureDay,ensureDay,drinksFor,totalFor,addDrink,undoToday,deleteDrink,resetDay,restoreDay,saveCup,deleteCup,saveSettings,replaceState};
  }

  window.WT_V1_HYDRATION={createApi};
})();