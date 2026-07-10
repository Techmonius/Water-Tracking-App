(function(){
  const C=window.WT_V1_CONFIG;

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function readJson(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):clone(fallback);}catch{return clone(fallback);}}

  function emptyState(){return{
    schemaVersion:C.schemaVersion,
    migratedAt:null,
    settings:{goalMode:'daily',dailyGoal:C.defaultGoal,weekdayGoal:C.defaultGoal,weekendGoal:C.defaultWeekendGoal,theme:'system'},
    cups:[{id:'owala',name:'Owala',oz:24},{id:'mug',name:'Mug',oz:12},{id:'stanley',name:'Stanley',oz:40}],
    days:{},
    backups:{},
    engagement:{permanent:{},daily:{counts:{},earnedByDate:{}},celebrations:{goalByDate:{}}}
  };}

  function normalize(state){
    const base=emptyState();
    const x=state&&typeof state==='object'?state:{};
    return{
      schemaVersion:C.schemaVersion,
      migratedAt:x.migratedAt||null,
      settings:{...base.settings,...(x.settings||{})},
      cups:Array.isArray(x.cups)&&x.cups.length?x.cups:base.cups,
      days:x.days&&typeof x.days==='object'?x.days:{},
      backups:x.backups&&typeof x.backups==='object'?x.backups:{},
      engagement:{
        permanent:{...(x.engagement?.permanent||{})},
        daily:{counts:{...(x.engagement?.daily?.counts||{})},earnedByDate:{...(x.engagement?.daily?.earnedByDate||{})}},
        celebrations:{goalByDate:{...(x.engagement?.celebrations?.goalByDate||{})}}
      }
    };
  }

  function migrateLegacy(){
    const next=emptyState();
    const old=readJson(C.legacyKeys.hydration,{});
    next.settings={
      goalMode:old.goalMode||'daily',
      dailyGoal:Number(old.goal||C.defaultGoal),
      weekdayGoal:Number(old.weekdayGoal||old.goal||C.defaultGoal),
      weekendGoal:Number(old.weekendGoal||C.defaultWeekendGoal),
      theme:old.theme||'system'
    };
    if(Array.isArray(old.cups)&&old.cups.length)next.cups=old.cups;
    next.days=old.days||{};
    next.backups=old.backups||{};

    const achievements=readJson(C.legacyKeys.achievements,{});
    const permanent=achievements.u||achievements.unlocked||{};
    Object.keys(permanent).forEach(id=>{next.engagement.permanent[id]={count:1,firstEarnedAt:new Date(permanent[id]).toISOString()};});

    const daily=readJson(C.legacyKeys.dailyWins,{days:{},counts:{}});
    next.engagement.daily.counts=daily.counts||{};
    next.engagement.daily.earnedByDate=daily.days||{};

    const celebrations=readJson(C.legacyKeys.celebrations,{});
    next.engagement.celebrations.goalByDate=celebrations||{};
    next.migratedAt=new Date().toISOString();
    return normalize(next);
  }

  function load(){
    const current=readJson(C.storageKey,null);
    if(current&&current.schemaVersion===C.schemaVersion)return normalize(current);
    const migrated=migrateLegacy();
    save(migrated);
    return migrated;
  }

  function save(state){localStorage.setItem(C.storageKey,JSON.stringify(normalize(state)));}

  function resetUserData(){
    [C.storageKey,C.legacyKeys.hydration,C.legacyKeys.achievements,C.legacyKeys.dailyWins,C.legacyKeys.celebrations].forEach(key=>localStorage.removeItem(key));
  }

  function exportData(state){
    const blob=new Blob([JSON.stringify(normalize(state),null,2)],{type:'application/json'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download='water-tracker-v1-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importData(raw){
    const parsed=typeof raw==='string'?JSON.parse(raw):raw;
    if(!parsed||parsed.schemaVersion!==C.schemaVersion||!parsed.days)throw new Error('Invalid Water Tracker v1 backup');
    const state=normalize(parsed);save(state);return state;
  }

  window.WT_V1_STORAGE={emptyState,normalize,migrateLegacy,load,save,resetUserData,exportData,importData};
})();
