// Plant 1 is the renderer reference. Plants 2+ use standalone raster stages and raster-only animation overlays.
(function(){
  const flowerLayer=(asset,cx,cy,box=null,scale=1.018)=>Object.freeze({asset,cx,cy,box,scale});
  const flowerAnimation=(layers)=>Object.freeze({layers:Object.freeze(layers)});
  const raster=(plant,stage)=>`v1/assets/plants/${plant}/stage-${stage}.png`;
  const overlay=(plant,stage,name)=>`v1/assets/plants/${plant}/overlays/stage-${stage}-${name}.png`;
  const STARTER_STAGES=[
    {name:'Seed',minGoalDays:0,asset:'v1/assets/plants/stage-1.webp',flowerAnimation:null},
    {name:'Sprout',minGoalDays:3,asset:'v1/assets/plants/stage-2.webp',flowerAnimation:null},
    {name:'Two Leaves',minGoalDays:6,asset:'v1/assets/plants/stage-3.webp',flowerAnimation:null},
    {name:'Leafy Plant',minGoalDays:10,asset:'v1/assets/plants/stage-4.webp',flowerAnimation:null},
    {name:'Bud',minGoalDays:15,asset:'v1/assets/plants/stage-5.webp',flowerAnimation:null},
    {name:'First Flower',minGoalDays:21,asset:'v1/assets/plants/stage-6.webp',flowerAnimation:flowerAnimation([
      flowerLayer('v1/assets/plants/overlays/stage-6-flower-1.svg',50,27)
    ])},
    {name:'More Flowers',minGoalDays:30,asset:'v1/assets/plants/stage-7.webp',flowerAnimation:flowerAnimation([
      flowerLayer('v1/assets/plants/overlays/stage-7-flower-1.svg',32,34),
      flowerLayer('v1/assets/plants/overlays/stage-7-flower-2.svg',50,24),
      flowerLayer('v1/assets/plants/overlays/stage-7-flower-3.svg',68,31)
    ])},
    {name:'Full Bloom',minGoalDays:45,asset:'v1/assets/plants/stage-8.webp',flowerAnimation:flowerAnimation([
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-1.webp',49.86,46.95,{x:35.15625,y:1.5625,w:26.5625,h:25},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-2.webp',46.92,46.8,{x:23.4375,y:12.5,w:26.5625,h:25},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-3.webp',47.08,45.03,{x:46.09375,y:21.09375,w:26.5625,h:24.21875},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-4.webp',54.86,51.61,{x:57.8125,y:28.90625,w:24.21875,h:22.65625},1.08),
      flowerLayer('v1/assets/plants/overlays/stage-8-flower-5.webp',48.25,51.88,{x:5.46875,y:35.15625,w:22.65625,h:21.09375},1.08)
    ])}
  ];
  const SUNFLOWER_STAGES=[
    {name:'Seed',minGoalDays:0,asset:raster('sunflower',1),flowerAnimation:null},
    {name:'Sprout',minGoalDays:4,asset:raster('sunflower',2),flowerAnimation:null},
    {name:'Young Plant',minGoalDays:8,asset:raster('sunflower',3),flowerAnimation:null},
    {name:'Taller Plant',minGoalDays:14,asset:raster('sunflower',4),flowerAnimation:null},
    {name:'Bud Forms',minGoalDays:20,asset:raster('sunflower',5),flowerAnimation:null},
    {name:'Flower Opening',minGoalDays:26,asset:raster('sunflower',6),flowerAnimation:flowerAnimation([
      flowerLayer(overlay('sunflower',6,'flower'),49.21,52.51,{x:35.15625,y:2.34375,w:32.03125,h:29.6875},1.06)
    ])},
    {name:'Full Sunflower',minGoalDays:32,asset:raster('sunflower',7),flowerAnimation:flowerAnimation([
      flowerLayer(overlay('sunflower',7,'flower'),48.07,51.85,{x:31.25,y:2.34375,w:42.1875,h:39.84375},1.07)
    ])},
    {name:'Sun Facing',minGoalDays:36,asset:raster('sunflower',8),flowerAnimation:flowerAnimation([
      flowerLayer(overlay('sunflower',8,'flower'),50.76,54.21,{x:27.34375,y:2.34375,w:46.09375,h:42.96875},1.08)
    ])}
  ];
  const MONSTERA_STAGES=[
    {name:'Seed',minGoalDays:0,asset:raster('monstera',1),flowerAnimation:null},
    {name:'Sprout',minGoalDays:4,asset:raster('monstera',2),flowerAnimation:null},
    {name:'Young Plant',minGoalDays:8,asset:raster('monstera',3),flowerAnimation:null},
    {name:'Growing Stronger',minGoalDays:13,asset:raster('monstera',4),flowerAnimation:null},
    {name:'Large Leaves',minGoalDays:19,asset:raster('monstera',5),flowerAnimation:null},
    {name:'Mature Plant',minGoalDays:26,asset:raster('monstera',6),flowerAnimation:null},
    {name:'Almost Full',minGoalDays:33,asset:raster('monstera',7),flowerAnimation:null},
    {name:'Full Monstera',minGoalDays:40,asset:raster('monstera',8),flowerAnimation:null}
  ];
  const CATALOG=Object.freeze({
    starter_flower:Object.freeze({id:'starter_flower',name:'Starter Flower',durationGoalDays:45,enabled:true,stages:Object.freeze(STARTER_STAGES.map(Object.freeze))}),
    sunflower:Object.freeze({id:'sunflower',name:'Sunflower',durationGoalDays:36,enabled:true,stages:Object.freeze(SUNFLOWER_STAGES.map(Object.freeze))}),
    monstera:Object.freeze({id:'monstera',name:'Monstera',durationGoalDays:40,enabled:true,stages:Object.freeze(MONSTERA_STAGES.map(Object.freeze))})
  });
  const DEFAULT_ID='starter_flower';
  function definition(id){return CATALOG[id]||CATALOG[DEFAULT_ID];}
  function stageFor(id,goalDays){const plant=definition(id),days=Math.max(0,Number(goalDays)||0);let index=0;for(let i=0;i<plant.stages.length;i++)if(days>=plant.stages[i].minGoalDays)index=i;return{index,stage:plant.stages[index],plant};}
  function progress(state,lifetimeGoalDays){const p=state?.plantProgress||{},plant=definition(p.currentPlantId),baseline=Math.max(0,Number(p.startedAtGoalDays)||0),days=Math.max(0,(Number(lifetimeGoalDays)||0)-baseline),current=stageFor(plant.id,days);return{plant,plantId:plant.id,baseline,goalDays:days,stageIndex:current.index,stage:current.stage,complete:days>=plant.durationGoalDays,completionPending:p.completionPending||null,completedPlants:Array.isArray(p.completedPlants)?p.completedPlants:[]};}
  function completedIds(progressState){return(progressState?.completedPlants||[]).map(x=>typeof x==='string'?x:x?.plantId).filter(Boolean);}
  function mysteryPool(doneIds=[]){const done=new Set(doneIds);return Object.values(CATALOG).filter(p=>p.id!==DEFAULT_ID&&p.enabled!==false&&!done.has(p.id));}
  function awardPendingSeed(pp,random=Math.random,now=()=>new Date().toISOString()){
    if(pp.nextSeed)return false;
    const pool=mysteryPool(completedIds(pp));
    if(!pool.length)return false;
    const raw=Math.floor((Number(random())||0)*pool.length),index=Math.max(0,Math.min(pool.length-1,raw)),next=pool[index];
    pp.nextSeed={plantId:next.id,awardedAt:now()};return true;
  }
  function reconcileCompletion(state,lifetimeGoalDays,random=Math.random,now=()=>new Date().toISOString()){
    const pp=state.plantProgress||(state.plantProgress={currentPlantId:DEFAULT_ID,startedAtGoalDays:0,startedAtDate:null,completionPending:null,completedPlants:[],nextSeed:null});
    if(!Array.isArray(pp.completedPlants))pp.completedPlants=[];
    const life=progress(state,lifetimeGoalDays);let changed=false;
    if(pp.completionPending){changed=awardPendingSeed(pp,random,now)||changed;return{changed,life};}
    if(!life.complete)return{changed:false,life};
    if(!completedIds(pp).includes(life.plantId)){pp.completedPlants.push({plantId:life.plantId,name:life.plant.name,completedAt:now(),goalDays:life.goalDays});changed=true;}
    pp.completionPending={plantId:life.plantId,plantName:life.plant.name,completedAt:now(),goalDays:life.goalDays};changed=true;
    changed=awardPendingSeed(pp,random,now)||changed;
    return{changed,life};
  }
  function plantMysterySeed(state,lifetimeGoalDays,startedAtDate){
    const pp=state.plantProgress||{},seed=pp.nextSeed;
    if(!pp.completionPending||!seed?.plantId)return null;
    const next=definition(seed.plantId);if(!next||next.enabled===false||next.id===DEFAULT_ID)return null;
    pp.currentPlantId=next.id;pp.startedAtGoalDays=Math.max(0,Number(lifetimeGoalDays)||0);pp.startedAtDate=startedAtDate||null;pp.completionPending=null;pp.nextSeed=null;state.plantProgress=pp;return next;
  }
  window.WT_V1_PLANTS={CATALOG,DEFAULT_ID,definition,stageFor,progress,completedIds,mysteryPool,reconcileCompletion,plantMysterySeed};
})();
