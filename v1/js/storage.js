(function(){
  const C=window.WT_V1_CONFIG;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const SCHEMA_MIGRATIONS=Object.freeze({});

  function stored(key){
    const raw=localStorage.getItem(key);
    if(raw===null)return{exists:false,value:null,raw:null};
    try{return{exists:true,value:JSON.parse(raw),raw};}
    catch(error){return{exists:true,value:null,raw,error};}
  }
  function readLegacyJson(key,fallback){
    const entry=stored(key);
    return entry.exists&&!entry.error?entry.value:clone(fallback);
  }
  function finiteInRange(value,min,max){const n=Number(value);return Number.isFinite(n)&&n>=min&&n<=max?n:null;}
  function validBirthday(value){
    if(!value)return'';
    const s=String(value);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return'';
    const [y,m,d]=s.split('-').map(Number),dt=new Date(y,m-1,d);
    return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d?s:'';
  }
  function validDayKey(key){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(key)))return false;
    const [y,m,d]=String(key).split('-').map(Number),dt=new Date(y,m-1,d);
    return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d;
  }
  function fallbackIsoForDay(key){
    const [y,m,d]=String(key).split('-').map(Number);
    return new Date(y,m-1,d,12,0,0,0).toISOString();
  }
  function emptyPlantProgress(){return{version:1,currentPlantId:'starter_flower',startedAtGoalDays:0,startedAtDate:null,completionPending:null,completedPlants:[],nextSeed:null};}
  function normalizePlantProgress(x){
    const b=emptyPlantProgress();x=x&&typeof x==='object'?x:{};
    return{version:1,currentPlantId:typeof x.currentPlantId==='string'&&x.currentPlantId?x.currentPlantId:b.currentPlantId,startedAtGoalDays:Math.max(0,Number(x.startedAtGoalDays)||0),startedAtDate:validDayKey(x.startedAtDate)?x.startedAtDate:null,completionPending:x.completionPending&&typeof x.completionPending==='object'?clone(x.completionPending):null,completedPlants:Array.isArray(x.completedPlants)?x.completedPlants.filter(Boolean).map(clone):[],nextSeed:x.nextSeed&&typeof x.nextSeed==='object'?clone(x.nextSeed):null};
  }
  function defaultSettings(){return{goalMode:'daily',dailyGoal:C.defaultGoal,weekdayGoal:C.defaultGoal,weekendGoal:C.defaultWeekendGoal,theme:'dark',birthday:''};}
  function normalizeSettings(x){
    const b=defaultSettings(),s=x&&typeof x==='object'?x:{};
    return{
      goalMode:s.goalMode==='weekdayWeekend'?'weekdayWeekend':'daily',
      dailyGoal:finiteInRange(s.dailyGoal,1,C.maxGoal)||b.dailyGoal,
      weekdayGoal:finiteInRange(s.weekdayGoal,1,C.maxGoal)||b.weekdayGoal,
      weekendGoal:finiteInRange(s.weekendGoal,1,C.maxGoal)||b.weekendGoal,
      theme:['system','light','dark'].includes(s.theme)?s.theme:b.theme,
      birthday:validBirthday(s.birthday)
    };
  }
  function validateSettingsInput(input,current=defaultSettings()){
    const next={...current,...(input||{})};
    for(const [key,label] of [['dailyGoal','Daily goal'],['weekdayGoal','Weekday goal'],['weekendGoal','Weekend goal']]){
      if(finiteInRange(next[key],1,C.maxGoal)===null)throw new Error(`${label} must be between 1 and ${C.maxGoal} oz.`);
    }
    if(!['daily','weekdayWeekend'].includes(next.goalMode))throw new Error('Choose a valid goal mode.');
    if(!['system','light','dark'].includes(next.theme))throw new Error('Choose a valid theme.');
    if(next.birthday&&validBirthday(next.birthday)!==String(next.birthday))throw new Error('Enter a valid birthday.');
    return normalizeSettings(next);
  }
  function normalizeCup(c,index){
    if(!c||typeof c!=='object')return null;
    const oz=finiteInRange(c.oz,1,C.maxCupOz);if(oz===null)return null;
    const name=String(c.name||'').trim().slice(0,40);if(!name)return null;
    const id=typeof c.id==='string'&&c.id?c.id:`cup-${index+1}`;
    return{id,name,oz};
  }
  function normalizeDrink(d,index,key){
    if(!d||typeof d!=='object')return null;
    const oz=finiteInRange(d.oz,0.01,C.maxDrinkOz);if(oz===null)return null;
    const id=typeof d.id==='string'&&d.id?d.id:`${key}-${index+1}`;
    const label=String(d.label||'Drink').slice(0,80);
    const parsed=new Date(d.at);
    const at=Number.isNaN(parsed.getTime())?fallbackIsoForDay(key):parsed.toISOString();
    return{id,oz,label,at};
  }
  function normalizeDays(raw){
    const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
    Object.keys(raw).forEach(key=>{
      if(!validDayKey(key))return;
      const day=raw[key]&&typeof raw[key]==='object'?raw[key]:{};
      const drinks=Array.isArray(day.drinks)?day.drinks.map((d,i)=>normalizeDrink(d,i,key)).filter(Boolean):[];
      out[key]={drinks};
    });
    return out;
  }
  function normalizeBackups(raw){
    const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
    Object.keys(raw).forEach(key=>{if(validDayKey(key)){const days=normalizeDays({[key]:raw[key]});if(days[key])out[key]=days[key];}});
    return out;
  }
  function emptyState(){return{schemaVersion:C.schemaVersion,migratedAt:null,settings:defaultSettings(),cups:[{id:'owala',name:'Owala',oz:24},{id:'mug',name:'Mug',oz:12},{id:'stanley',name:'Stanley',oz:40}],days:{},backups:{},plantProgress:emptyPlantProgress(),engagement:{permanent:{},daily:{counts:{},earnedByDate:{}},celebrations:{goalByDate:{}}}};}
  function normalize(x){
    const b=emptyState();x=x&&typeof x==='object'?x:{};
    const cups=Array.isArray(x.cups)?x.cups.map(normalizeCup).filter(Boolean):b.cups;
    return{schemaVersion:C.schemaVersion,migratedAt:x.migratedAt||null,settings:normalizeSettings(x.settings),cups,days:normalizeDays(x.days),backups:normalizeBackups(x.backups),plantProgress:normalizePlantProgress(x.plantProgress),engagement:{permanent:{...(x.engagement?.permanent||{})},daily:{counts:{...(x.engagement?.daily?.counts||{})},earnedByDate:{...(x.engagement?.daily?.earnedByDate||{})}},celebrations:{goalByDate:{...(x.engagement?.celebrations?.goalByDate||{})}}}};
  }
  function legacyState(){
    const n=emptyState(),old=readLegacyJson(C.legacyKeys.hydration,{});
    n.settings=normalizeSettings({goalMode:old.goalMode||'daily',dailyGoal:old.goal||C.defaultGoal,weekdayGoal:old.weekdayGoal||old.goal||C.defaultGoal,weekendGoal:old.weekendGoal||C.defaultWeekendGoal,theme:old.theme||'dark',birthday:old.birthday||''});
    if(Array.isArray(old.cups))n.cups=old.cups.map(normalizeCup).filter(Boolean);
    n.days=normalizeDays(old.days||{});n.backups=normalizeBackups(old.backups||{});
    const a=readLegacyJson(C.legacyKeys.achievements,{}),p=a.u||a.unlocked||{};
    Object.keys(p).forEach(id=>{const raw=p[id],date=new Date(raw);n.engagement.permanent[id]={count:1,firstEarnedAt:Number.isNaN(date.getTime())?new Date().toISOString():date.toISOString()};});
    const d=readLegacyJson(C.legacyKeys.dailyWins,{days:{},counts:{}});n.engagement.daily.counts=d.counts&&typeof d.counts==='object'?d.counts:{};n.engagement.daily.earnedByDate=d.days&&typeof d.days==='object'?d.days:{};
    n.engagement.celebrations.goalByDate=readLegacyJson(C.legacyKeys.celebrations,{});
    n.migratedAt=new Date().toISOString();return normalize(n);
  }
  function migrateCurrent(raw){
    if(!raw||typeof raw!=='object')throw new Error('Stored Water Tracker data is invalid. Export browser data before clearing anything.');
    let state=clone(raw),version=Number(state.schemaVersion);
    if(!Number.isInteger(version))version=2;
    if(version>C.schemaVersion)throw new Error(`Stored data uses schema ${version}, newer than this app supports (${C.schemaVersion}). Data was left untouched.`);
    while(version<C.schemaVersion){
      const migrate=SCHEMA_MIGRATIONS[version];
      if(typeof migrate!=='function')throw new Error(`Missing data migration from schema ${version}. Data was left untouched.`);
      state=migrate(state);version=Number(state.schemaVersion);
    }
    return normalize(state);
  }
  function save(s){const next=normalize(s);localStorage.setItem(C.storageKey,JSON.stringify(next));return next;}
  function load(){
    const current=stored(C.storageKey);
    if(current.exists){if(current.error)throw new Error('Stored Water Tracker data could not be read. Data was left untouched.');return migrateCurrent(current.value);}
    const migrated=legacyState();return save(migrated);
  }
  function update(mutator){
    const state=load(),result=mutator?.(state);
    if(result===false)return state;
    return save(state);
  }
  function resetUserData(){[C.storageKey,C.legacyKeys.hydration,C.legacyKeys.achievements,C.legacyKeys.dailyWins,C.legacyKeys.celebrations].forEach(k=>localStorage.removeItem(k));}
  function exportData(s){const blob=new Blob([JSON.stringify(normalize(s),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='water-tracker-backup.json';a.click();URL.revokeObjectURL(a.href);}
  function validateBackup(p){
    if(!p||typeof p!=='object'||Array.isArray(p))throw new Error('Invalid Water Tracker backup.');
    if(Number(p.schemaVersion)!==C.schemaVersion)throw new Error(`Backup schema must be ${C.schemaVersion}.`);
    validateSettingsInput(p.settings||{},defaultSettings());
    if(!p.days||typeof p.days!=='object'||Array.isArray(p.days))throw new Error('Backup is missing day data.');
    if(p.cups!==undefined&&!Array.isArray(p.cups))throw new Error('Backup cups are invalid.');
    (p.cups||[]).forEach((cup,i)=>{if(!normalizeCup(cup,i))throw new Error('Backup contains an invalid cup.');});
    Object.entries(p.days).forEach(([key,day])=>{
      if(!validDayKey(key)||!day||!Array.isArray(day.drinks))throw new Error(`Backup contains an invalid day: ${key}.`);
      day.drinks.forEach(d=>{
        if(!d||finiteInRange(d.oz,0.01,C.maxDrinkOz)===null)throw new Error(`Backup contains an invalid drink on ${key}.`);
        if(d.at&&Number.isNaN(new Date(d.at).getTime()))throw new Error(`Backup contains an invalid drink time on ${key}.`);
      });
    });
    return true;
  }
  function importData(raw){const p=typeof raw==='string'?JSON.parse(raw):raw;validateBackup(p);return save(migrateCurrent(p));}
  window.WT_V1_STORAGE={emptyState,normalize,normalizeSettings,validateSettingsInput,migrateLegacy:legacyState,migrateCurrent,schemaMigrations:SCHEMA_MIGRATIONS,load,save,update,resetUserData,exportData,validateBackup,importData};
})();
