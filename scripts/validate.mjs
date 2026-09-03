import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const failures=[];
const pass=message=>console.log('✓',message);
const fail=message=>{failures.push(message);console.error('✗',message);};
const assert=(condition,message)=>condition?pass(message):fail(message);
const exists=p=>fs.existsSync(path.join(root,p));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const localRef=value=>{
  if(!value||/^(?:https?:|data:|mailto:|#)/i.test(value))return null;
  return value.split(/[?#]/)[0].replace(/^\.\//,'').replace(/^\//,'');
};

function syntaxCheck(){
  const dirs=['v1/js'];
  const files=[];
  for(const dir of dirs)for(const name of fs.readdirSync(path.join(root,dir)))if(name.endsWith('.js'))files.push(path.join(dir,name));
  files.push('service-worker.js');
  for(const file of files){try{execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});}catch(error){fail(`JavaScript syntax: ${file}\n${error.stderr?.toString()||error.message}`);}}
  if(!failures.some(x=>x.startsWith('JavaScript syntax')))pass('All production JavaScript parses');
}

function staticReferences(){
  const index=read('index.html');
  const refs=[...index.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map(m=>localRef(m[1])).filter(Boolean);
  refs.forEach(ref=>assert(exists(ref),`index reference exists: ${ref}`));

  const sw=read('service-worker.js'),block=sw.match(/const CORE_ASSETS=\[(.*?)\];/s)?.[1]||'';
  assert(!sw.includes("cache.put('./index.html'"),'service worker never mutates the cached app shell at runtime');
  assert(sw.includes("key.startsWith(CACHE_PREFIX)"),'service worker deletes only Water Tracker caches');
  assert(sw.includes("LEGACY_RECOVERY_CACHE='water-tracker-1.8.1'"),'v1.8.1 has an explicit safe recovery path');
  const core=[...block.matchAll(/["']([^"']+)["']/g)].map(m=>localRef(m[1])).filter(Boolean);
  core.filter(ref=>ref).forEach(ref=>assert(exists(ref),`service-worker core asset exists: ${ref}`));

  const manifest=JSON.parse(read('manifest.webmanifest'));
  (manifest.icons||[]).forEach(icon=>assert(exists(localRef(icon.src)),`manifest icon exists: ${icon.src}`));

  const configVersion=read('v1/js/config.js').match(/appVersion:\s*['"]([^'"]+)/)?.[1];
  const fileVersion=read('v1-version.txt').trim();
  const cacheVersion=read('service-worker.js').match(/CACHE_NAME=['"]water-tracker-([^'"]+)/)?.[1];
  assert(Boolean(configVersion)&&configVersion===fileVersion&&fileVersion===cacheVersion,`version alignment: ${configVersion} / ${fileVersion} / ${cacheVersion}`);

  const jsText=fs.readdirSync(path.join(root,'v1/js')).filter(x=>x.endsWith('.js')).map(x=>read(path.join('v1/js',x))).join('\n');
  assert(!jsText.includes('plant-alignment.js'),'no missing plant-alignment dependency');
  assert(!/data:image\//i.test(jsText),'no production image data embedded in JavaScript');

  const legacy=[
    'v18.html','v1.html','V1_REFACTOR_PLAN.md','achievement-menu-v26.js','achievements-v22.js','app-telemetry-v18.js','app.js','build.js','config.js','current-v16.js','daily-wins-v26.css','daily-wins-v26.js','date.js','edit-days-v16.js','engage-plus-v23.css','engagement-v22.css','fix-v11.css','goal-celebration-v23.js','living-plant-v24.js','plant-calendar-v23.js','plant-plus-v24.css','progress-v22.js','settings-v14.js','storage.js','style.css','styles.css','telemetry.js','touch-v15.js','ui.js','update-fix.js','legacy/v26-index.html',
    'v1/js/parity.js','v1/css/parity.css','v1/css/calendar-parity.css','v1/css/progress-parity.css','v1/css/refinements.css'
  ];
  legacy.forEach(file=>assert(!exists(file),`legacy/obsolete file removed: ${file}`));
}

function plantAssets(){
  const context={window:{}};vm.createContext(context);vm.runInContext(read('v1/js/plants.js'),context,{filename:'plants.js'});
  const catalog=context.window.WT_V1_PLANTS?.CATALOG||{};
  assert(Object.keys(catalog).length>=3,'plant catalog loads');
  for(const plant of Object.values(catalog)){
    let previous=-1;
    plant.stages.forEach((stage,index)=>{
      assert(stage.minGoalDays>previous,`${plant.id} stage ${index+1} threshold is increasing`);previous=stage.minGoalDays;
      assert(exists(stage.asset),`${plant.id} stage ${index+1} asset exists`);
      (stage.flowerAnimation?.layers||[]).forEach((layer,i)=>assert(exists(layer.asset),`${plant.id} stage ${index+1} overlay ${i+1} exists`));
    });
    assert(plant.stages.at(-1).minGoalDays===plant.durationGoalDays,`${plant.id} final stage matches duration`);
  }
}

function makeDomainContext(){
  const map=new Map();
  const localStorage={getItem:key=>map.has(key)?map.get(key):null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key),clear:()=>map.clear()};
  const context={window:{},localStorage,console,Date,Math,JSON,Map,Set,Intl,Blob:globalThis.Blob,URL:globalThis.URL,crypto:{randomUUID:()=>`id-${Math.random()}`},CustomEvent:class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}},document:{createElement:()=>({click(){}})}};
  context.window.window=context.window;context.window.dispatchEvent=()=>{};context.window.addEventListener=()=>{};context.window.localStorage=localStorage;
  vm.createContext(context);
  for(const file of ['v1/js/config.js','v1/js/date.js','v1/js/storage.js','v1/js/hydration.js','v1/js/stats.js','v1/js/plants.js'])vm.runInContext(read(file),context,{filename:file});
  return{context,localStorage,map,C:context.window.WT_V1_CONFIG,D:context.window.WT_V1_DATE,S:context.window.WT_V1_STORAGE,H:context.window.WT_V1_HYDRATION,ST:context.window.WT_V1_STATS,P:context.window.WT_V1_PLANTS};
}

function domainTests(){
  {
    const {localStorage,C,D,S,H}=makeDomainContext();const key=D.dayKey();
    localStorage.setItem(C.legacyKeys.hydration,JSON.stringify({goal:120,cups:[{id:'legacy-cup',name:'Legacy',oz:24}],days:{[key]:{drinks:[{id:'legacy-drink',oz:24,label:'Legacy',at:new Date().toISOString()}]}}}));
    const migrated=S.load();assert(Boolean(localStorage.getItem(C.storageKey)),'legacy data migrates once into current storage');
    const api=H.createApi(migrated,()=>{});api.deleteDrink(key,'legacy-drink');
    assert(S.load().days[key].drinks.length===0,'deleted migrated drink does not reappear from legacy storage');
    for(const cup of [...api.getState().cups])api.deleteCup(cup.id);
    assert(S.load().cups.length===0,'users can delete all cups without defaults reappearing');
    const before=api.goalFor();let threw=false;try{api.saveSettings({dailyGoal:0});}catch{threw=true;}
    assert(threw&&api.goalFor()===before,'invalid goal settings are rejected in the domain layer');
    const bad=S.emptyState();bad.days[key]={drinks:[{id:'bad',oz:'not-a-number',label:'bad',at:new Date().toISOString()}]};
    threw=false;try{S.importData(JSON.stringify(bad));}catch{threw=true;}
    assert(threw,'malformed imported drink records are rejected');
    const future={...S.emptyState(),schemaVersion:C.schemaVersion+1},raw=JSON.stringify(future);localStorage.setItem(C.storageKey,raw);threw=false;try{S.load();}catch{threw=true;}
    assert(threw&&localStorage.getItem(C.storageKey)===raw,'newer unknown schema is never overwritten');
    for(let version=2;version<C.schemaVersion;version++)assert(typeof S.schemaMigrations[version]==='function',`schema ${version} has an explicit migration`);
  }
  {
    const {D,S,H,ST}=makeDomainContext(),state=S.emptyState(),today=D.dayKey(),yesterdayDate=D.dateFromKey(today);yesterdayDate.setDate(yesterdayDate.getDate()-1);const yesterday=D.dayKey(yesterdayDate);
    state.days[yesterday]={drinks:[{id:'y',oz:120,label:'Test',at:new Date(yesterdayDate.getFullYear(),yesterdayDate.getMonth(),yesterdayDate.getDate(),12).toISOString()}]};
    let api=H.createApi(state,()=>{}),stats=ST.calculate(api);assert(stats.currentStreak===1,'current streak persists during the next unfinished day');
    const long=S.emptyState();for(let i=399;i>=0;i--){const d=D.dateFromKey(today);d.setDate(d.getDate()-i);const key=D.dayKey(d);long.days[key]={drinks:[{id:`d-${i}`,oz:120,label:'Test',at:new Date(d.getFullYear(),d.getMonth(),d.getDate(),12).toISOString()}]};}
    api=H.createApi(long,()=>{});stats=ST.calculate(api);assert(stats.bestStreak===400&&stats.currentStreak===400,'streak calculation covers full stored history beyond 365 days');
    const one=S.emptyState();one.days[today]={drinks:[{id:'a',oz:120,label:'A',at:new Date().toISOString()},{id:'b',oz:120,label:'B',at:new Date().toISOString()}]};api=H.createApi(one,()=>{});stats=ST.calculate(api);assert(stats.goalDays===1,'over-goal hydration still creates only one plant goal day per calendar day');
  }
  {
    const {D,S,P}=makeDomainContext(),state=S.emptyState();
    let result=P.reconcileCompletion(state,45,()=>0,()=> '2026-09-03T12:00:00.000Z');
    assert(result.changed&&state.plantProgress.completionPending?.plantId==='starter_flower','completed plant creates one completion handoff');
    assert(state.plantProgress.nextSeed?.plantId==='sunflower','completed starter plant receives an enabled Mystery Seed');
    const planted=P.plantMysterySeed(state,45,D.dayKey());assert(planted?.id==='sunflower'&&state.plantProgress.startedAtGoalDays===45,'Mystery Seed starts the next plant at the current lifetime baseline');
    const caughtUp=S.emptyState();caughtUp.plantProgress.currentPlantId='sunflower';caughtUp.plantProgress.completedPlants=[{plantId:'starter_flower'},{plantId:'sunflower'}];caughtUp.plantProgress.completionPending={plantId:'sunflower'};caughtUp.plantProgress.nextSeed=null;
    P.reconcileCompletion(caughtUp,45,()=>0,()=> '2026-09-03T12:00:00.000Z');assert(caughtUp.plantProgress.nextSeed?.plantId==='monstera','a previously caught-up user receives a newly available plant seed');
  }
}

syntaxCheck();
staticReferences();
plantAssets();
domainTests();

if(failures.length){console.error(`\n${failures.length} validation failure(s).`);process.exit(1);}
console.log('\nWater Tracker validation passed.');
